"""RAG chain: retrieve → build context → stream LLM response."""

import json
from typing import AsyncGenerator

from services.chunking.enricher import enrich_for_query
from services.embeddings.batch_processor import embed_batch
from services.llm.prompts import SYSTEM_PROMPT, build_user_message, NO_CONTEXT_MESSAGE
from services.llm.qwen_client import stream_completion
from services.rag.context_builder import build_context
from services.vectorstore.filters import (
    build_document_filter,
    build_repos_filter,
    build_source_filter,
)
from services.vectorstore.search import semantic_search


async def run_rag_chain(
    query: str,
    workspace_id: str,
    document_ids: list[str] | None = None,
    repo_ids: list[str] | None = None,
    source: str = "all",
) -> AsyncGenerator[tuple[str, list[str] | None], None]:
    # ── 1. Enrich + embed ────────────────────────────────────────────────────
    enriched = enrich_for_query(query)
    query_vector = embed_batch([enriched])[0]

    # ── 2. Build filter ───────────────────────────────────────────────────────
    if document_ids:
        # User @-tagged specific documents
        qdrant_filter = build_document_filter(workspace_id, document_ids)
    elif repo_ids:
        # User @-tagged specific repos
        qdrant_filter = build_repos_filter(workspace_id, repo_ids)
    else:
        # Use the source toggle: all / documents / github
        qdrant_filter = build_source_filter(workspace_id, source)

    # ── 3. Semantic search ─────────────────────────────────────────────────────
    # Retrieve a wider candidate pool (30) so the context builder has more
    # material to score, especially important for code repos where individual
    # chunk similarity scores tend to be lower than prose.
    hits = semantic_search(query_vector, qdrant_filter, top_k=30)

    # ── 4. Guard: nothing indexed yet ────────────────────────────────────────
    if not hits:
        yield json.dumps({"token": NO_CONTEXT_MESSAGE, "done": False}), None
        yield json.dumps({"citations": [], "done": True}), []
        return

    # ── 5. Build context ──────────────────────────────────────────────────────
    # top_n=10 ensures up to 10 chunks reach the LLM, giving it enough
    # material to extract code snippets and cross-file references.
    context, retrieved_ids = build_context(hits, top_n=10)

    # ── 6. Stream LLM ─────────────────────────────────────────────────────────
    user_message = build_user_message(query, context)
    async for token in stream_completion(user_message, SYSTEM_PROMPT):
        yield json.dumps({"token": token, "done": False}), None

    # ── 6. Build citations (documents + GitHub chunks) ────────────────────────
    citations = []
    seen = set()
    for hit in hits:
        payload = hit.payload or {}
        is_github = payload.get("source") == "github"

        if is_github:
            repo_id = payload.get("repoId")
            if not repo_id or repo_id in seen:
                continue
            seen.add(repo_id)
            citations.append({
                "repoId":      repo_id,
                "repoFullName": payload.get("repoFullName"),
                "sourceType":  payload.get("sourceType"),   # file | commit | issue | pull_request
                "filePath":    payload.get("filePath"),
                "githubUrl":   payload.get("githubUrl"),
                "chunkPreview": (payload.get("chunkText") or "")[:2000],
                "isGitHub":    True,
            })
        else:
            doc_id = payload.get("documentId")
            if not doc_id or doc_id in seen:
                continue
            seen.add(doc_id)
            citations.append({
                "documentId":  doc_id,
                "fileName":    payload.get("fileName"),
                "pageNumber":  payload.get("pageNumber"),
                "chunkPreview": (payload.get("chunkText") or "")[:500],
                "isGitHub":    False,
            })

    yield json.dumps({"citations": citations, "done": True}), retrieved_ids
