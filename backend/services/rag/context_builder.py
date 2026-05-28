from qdrant_client.models import ScoredPoint


def build_context(hits: list[ScoredPoint], top_n: int = 5) -> tuple[str, list[str]]:
    """
    Format the top-N Qdrant hits into a readable context block for the LLM.

    Returns:
        context:      Multi-line string ready to inject into the prompt.
        document_ids: Deduplicated list of documentId values (for AuditLog).
    """
    selected = hits[:top_n]
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
