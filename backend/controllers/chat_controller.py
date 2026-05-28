"""
Chat controller — implements the 10-step RAG flow for a single user query.

The route handler iterates the returned async generator and forwards each
yielded string as an SSE data line.
"""

from typing import AsyncGenerator

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from models.audit_log import AuditLog
from schemas.chat import ChatRequest
from schemas.user import CurrentUser
from services.rag.rag_chain import run_rag_chain
from utils.logger import get_logger

logger = get_logger(__name__)


async def handle_chat(
    request: ChatRequest,
    current_user: CurrentUser,
) -> AsyncGenerator[str, None]:
    """
    Orchestrate the RAG pipeline and yield raw SSE-formatted strings.

    Each yielded value is a complete SSE line ready for the StreamingResponse:
        "data: {...}\n\n"

    The final event carries citations; the controller logs them to AuditLog.
    """
    workspace_id = current_user.workspace_id

    # ── Validate document_ids belong to the caller's workspace ────────────────
    # (Full ownership check is done inside the Qdrant filter — vectors from
    # other workspaces are structurally excluded.  An empty result simply means
    # the doc IDs don't exist in this workspace, which is safe.)

    logger.info(
        "Chat request received",
        user_id=current_user.id,
        workspace_id=workspace_id,
        query_len=len(request.query),
        doc_filter=request.document_ids,
    )

    retrieved_doc_ids: list[str] = []

    try:
        async for sse_data, doc_ids in run_rag_chain(
            query=request.query,
            workspace_id=workspace_id,
            document_ids=request.document_ids,
        ):
            if doc_ids is not None:
                retrieved_doc_ids = doc_ids

            yield f"data: {sse_data}\n\n"

    except Exception as exc:
        logger.error("RAG chain failed", error=str(exc), workspace_id=workspace_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI service encountered an error. Please try again.",
        ) from exc

    finally:
        # ── Always write audit log, even on partial failure ───────────────────
        try:
            log = AuditLog(
                user_id=PydanticObjectId(current_user.id),
                workspace_id=PydanticObjectId(workspace_id),
                action="query",
                query_text=request.query[:1000],
                retrieved_document_ids=retrieved_doc_ids,
            )
            await log.insert()
        except Exception as log_exc:
            logger.warning("Audit log insert failed", error=str(log_exc))
