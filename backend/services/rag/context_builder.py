from pathlib import PurePosixPath

from qdrant_client.models import ScoredPoint

_EXT_LANG: dict[str, str] = {
    ".py": "python", ".ts": "typescript", ".tsx": "typescript",
    ".js": "javascript", ".jsx": "javascript", ".go": "go",
    ".rs": "rust", ".java": "java", ".rb": "ruby", ".sh": "bash",
    ".yml": "yaml", ".yaml": "yaml", ".toml": "toml",
    ".json": "json", ".sql": "sql", ".graphql": "graphql",
    ".html": "html", ".css": "css", ".scss": "scss",
}


def _code_lang(path: str) -> str:
    return _EXT_LANG.get(PurePosixPath(path).suffix.lower(), "")


def _format_block(payload: dict) -> str:
    chunk_text = payload.get("chunkText", "")
    is_github = payload.get("source") == "github"

    if not is_github:
        file_name = payload.get("fileName", "unknown")
        page = payload.get("pageNumber")
        page_label = f"Page {page}" if page is not None else "Page N/A"
        return f"[Source: {file_name}, {page_label}]\n{chunk_text}"

    source_type = payload.get("sourceType", "file")
    repo = payload.get("repoFullName", "")

    if source_type == "file":
        file_path = payload.get("filePath", "unknown")
        lang = _code_lang(file_path)
        header = f"[Source: {repo}/{file_path}]"
        if lang:
            return f"{header}\n```{lang}\n{chunk_text}\n```"
        return f"{header}\n{chunk_text}"

    if source_type == "commit":
        sha = payload.get("commitSha", "")[:8]
        author = payload.get("authorName", "")
        msg = payload.get("commitMessage", "")
        header = f"[Source: {repo} · commit {sha} by {author}: {msg}]"
        return f"{header}\n{chunk_text}"

    if source_type == "issue":
        num = payload.get("issueNumber", "")
        title = payload.get("issueTitle", "")
        header = f"[Source: {repo} · Issue #{num}: {title}]"
        return f"{header}\n{chunk_text}"

    if source_type == "pull_request":
        num = payload.get("prNumber", "")
        title = payload.get("prTitle", "")
        header = f"[Source: {repo} · PR #{num}: {title}]"
        return f"{header}\n{chunk_text}"

    return f"[Source: {repo}]\n{chunk_text}"


_MAX_CHUNK_CHARS = 2000   # truncate any single chunk to this length
_MAX_CONTEXT_CHARS = 16000  # total context ceiling (~4k tokens, safe for Groq)


def build_context(
    hits: list[ScoredPoint],
    top_n: int = 10,
    relative_threshold: float = 0.70,
    abs_min_score: float = 0.20,
    citation_threshold: float = 0.90,
) -> tuple[str, list[str]]:
    """
    Format the top-N Qdrant hits into a readable context block for the LLM.

    Threshold notes:
    - relative_threshold (0.70): controls which chunks enter the LLM context
      relative to the best-scoring hit. Lowered from 0.80 so that code chunks
      (which naturally score lower than prose against natural-language queries)
      are not silently dropped.
    - abs_min_score (0.20): absolute floor. Lowered from 0.35 for the same
      reason — code-to-query cosine similarity is typically 0.20–0.45.
    - citation_threshold (0.90): tighter threshold for the UI citation panel;
      only highly relevant sources appear there.

    Fallback guarantee: if nothing passes the threshold (rare but possible),
    we always surface the top-3 hits so the LLM has something to work with.
    """
    if not hits:
        return "", []

    best_score = hits[0].score
    min_score = max(best_score * relative_threshold, abs_min_score)

    selected = [h for h in hits if h.score >= min_score][:top_n]

    # Guarantee at least 3 chunks reach the LLM so it has enough material
    # to produce a useful answer, even when scores are uniformly low.
    if len(selected) < 3 and len(hits) >= 3:
        selected = hits[:3]
    elif not selected and hits:
        selected = hits[:1]

    blocks: list[str] = []
    total_chars = 0
    for h in selected:
        block = _format_block(h.payload or {})
        if len(block) > _MAX_CHUNK_CHARS:
            block = block[:_MAX_CHUNK_CHARS] + "\n… [truncated]"
        if total_chars + len(block) > _MAX_CONTEXT_CHARS:
            break
        blocks.append(block)
        total_chars += len(block)
    context = "\n\n".join(blocks)

    # ── Build citation doc IDs (tighter threshold) ────────────────
    citation_min = best_score * citation_threshold
    citation_doc_ids: list[str] = []
    seen: set[str] = set()

    for hit in selected:
        if hit.score >= citation_min:
            doc_id = (hit.payload or {}).get("documentId", "")
            if doc_id and doc_id not in seen:
                seen.add(doc_id)
                citation_doc_ids.append(doc_id)

    # Always cite at least the best-matching document
    best_doc_id = (selected[0].payload or {}).get("documentId", "") if selected else ""
    if best_doc_id and best_doc_id not in seen:
        citation_doc_ids.insert(0, best_doc_id)

    return context, citation_doc_ids
