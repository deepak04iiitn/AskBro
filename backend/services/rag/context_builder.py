from qdrant_client.models import ScoredPoint


def build_context(
    hits: list[ScoredPoint],
    top_n: int = 5,
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

    # ── Build context blocks (all selected chunks) ────────────────
    blocks: list[str] = []
    for hit in selected:
        payload = hit.payload or {}
        file_name = payload.get("fileName", "unknown")
        page = payload.get("pageNumber")
        chunk_text = payload.get("chunkText", "")
        page_label = f"Page {page}" if page is not None else "Page N/A"
        blocks.append(f"[Source: {file_name}, {page_label}]\n{chunk_text}")

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
