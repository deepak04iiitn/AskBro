from qdrant_client.models import ScoredPoint


def build_context(
    hits: list[ScoredPoint],
    top_n: int = 5,
    relative_threshold: float = 0.80,
    abs_min_score: float = 0.35,
) -> tuple[str, list[str]]:
    """
    Format the top-N Qdrant hits into a readable context block for the LLM.

    Applies a relative score threshold so that chunks from irrelevant documents
    don't contaminate the context when a clearly more relevant document exists.

    Args:
        hits:               Scored points from Qdrant, sorted desc by score.
        top_n:              Maximum chunks to include in context.
        relative_threshold: Only keep chunks whose score ≥ best_score × this value.
                            0.80 means a chunk must score at least 80% as well as
                            the best-matching chunk to be included.
        abs_min_score:      Hard floor — chunks below this are always excluded,
                            regardless of relative threshold.

    Returns:
        context:      Multi-line string ready to inject into the prompt.
        document_ids: Deduplicated list of documentId values (for AuditLog / citations).
    """
    if not hits:
        return "", []

    # Best hit comes first (Qdrant returns descending order)
    best_score = hits[0].score

    # Minimum score = higher of (relative floor, absolute floor)
    min_score = max(best_score * relative_threshold, abs_min_score)

    # Filter then cap at top_n
    selected = [h for h in hits if h.score >= min_score][:top_n]

    # Guarantee at least the single best hit even if it falls below abs_min
    if not selected and hits:
        selected = hits[:1]

    blocks: list[str] = []
    document_ids: list[str] = []
    seen_doc_ids: set[str] = set()

    for hit in selected:
        payload = hit.payload or {}
        file_name = payload.get("fileName", "unknown")
        page = payload.get("pageNumber")
        chunk_text = payload.get("chunkText", "")
        doc_id = payload.get("documentId", "")

        page_label = f"Page {page}" if page is not None else "Page N/A"
        header = f"[Source: {file_name}, {page_label}]"
        blocks.append(f"{header}\n{chunk_text}")

        if doc_id and doc_id not in seen_doc_ids:
            seen_doc_ids.add(doc_id)
            document_ids.append(doc_id)

    context = "\n\n".join(blocks)
    return context, document_ids
