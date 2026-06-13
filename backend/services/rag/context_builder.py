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


def build_context(
    hits: list[ScoredPoint],
    top_n: int = 8,
    relative_threshold: float = 0.80,
    abs_min_score: float = 0.35,
    citation_threshold: float = 0.92,
) -> tuple[str, list[str]]:
    """
    Format the top-N Qdrant hits into a readable context block for the LLM.

    Uses two separate thresholds:
    - relative_threshold (0.80): loose — controls which chunks enter the LLM context.
    - citation_threshold (0.92): tight — controls which documents are shown as citations.
      Only documents with a chunk scoring ≥ best_score × 0.92 are cited, so citations
      reflect where the answer actually came from rather than every searched file.
    """
    if not hits:
        return "", []

    best_score = hits[0].score
    min_score = max(best_score * relative_threshold, abs_min_score)

    selected = [h for h in hits if h.score >= min_score][:top_n]
    if not selected and hits:
        selected = hits[:1]

    context = "\n\n".join(_format_block(h.payload or {}) for h in selected)

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
