"""
RAG chain orchestration: retrieve → build context → stream LLM response.

This module wires together vectorstore search, context formatting, and LLM
streaming. The controller calls run_rag_chain and async-iterates the yielded
SSE events.
"""

import json
from typing import AsyncGenerator

from services.chunking.enricher import enrich_for_query
from services.embeddings.batch_processor import embed_batch
from services.llm.prompts import SYSTEM_PROMPT, build_user_message
from services.llm.qwen_client import stream_completion
from services.rag.context_builder import build_context
from services.vectorstore.filters import build_document_filter, build_workspace_filter
from services.vectorstore.search import semantic_search


async def run_rag_chain(
    query: str,
    workspace_id: str,
    document_ids: list[str] | None = None,
) -> AsyncGenerator[tuple[str, list[str] | None], None]:
    """
    Run the full RAG pipeline and yield SSE-ready (event_data, citations) tuples.

    Yields:
        (json_str, None)       — for each token event  {"token": "...", "done": false}
        (json_str, citations)  — for the final event   {"citations": [...], "done": true}

    Args:
        query:        Raw user question.
        workspace_id: Caller's workspace — always scopes the Qdrant filter.
        document_ids: Optional list of doc IDs to narrow retrieval.
    """
    # ── 1. Enrich query with BGE prefix ──────────────────────────────────────
    enriched = enrich_for_query(query)

    # ── 2. Embed query (single item, same batch_processor path) ──────────────
    query_vector = embed_batch([enriched])[0]

    # ── 3. Build Qdrant filter ────────────────────────────────────────────────
    if document_ids:
        qdrant_filter = build_document_filter(workspace_id, document_ids)
    else:
        qdrant_filter = build_workspace_filter(workspace_id)

    # ── 4. Semantic search — top-20 hits ─────────────────────────────────────
    hits = semantic_search(query_vector, qdrant_filter, top_k=20)

    # ── 5. Build context block from top-5 hits ────────────────────────────────
    context, retrieved_doc_ids = build_context(hits, top_n=5)

    # ── 6. Build prompt ───────────────────────────────────────────────────────
    user_message = build_user_message(query, context)

    # ── 7. Stream LLM response ────────────────────────────────────────────────
    async for token in stream_completion(user_message, SYSTEM_PROMPT):
        yield json.dumps({"token": token, "done": False}), None

    # ── 8. Final event with citations ─────────────────────────────────────────
    # hits are sorted by score descending, so the first match per doc is the best chunk.
    citations = []
    for doc_id in retrieved_doc_ids:
        best_hit = next(
            (h for h in hits if h.payload and h.payload.get("documentId") == doc_id),
            None,
        )
        payload = best_hit.payload if best_hit else {}
        citations.append({
            "documentId": doc_id,
            "fileName": payload.get("fileName"),
            "pageNumber": payload.get("pageNumber"),
            "chunkPreview": (payload.get("chunkText") or "")[:500],
        })
    yield json.dumps({"citations": citations, "done": True}), retrieved_doc_ids
