"""Chat controller — RAG flow + persistent chat/message storage."""

import json as _json
from datetime import datetime, timezone
from typing import AsyncGenerator

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from models.audit_log import AuditLog
from models.chat import Chat
from models.message import Message
from schemas.chat import ChatRequest, ChatSummary, MessageResponse
from schemas.user import CurrentUser
from services.rag.rag_chain import run_rag_chain
from utils.logger import get_logger

logger = get_logger(__name__)


# ── Chat CRUD ────────────────────────────────────────────────────────────────

async def create_chat(current_user: CurrentUser) -> ChatSummary:
    chat = Chat(
        workspace_id=PydanticObjectId(current_user.workspace_id),
        created_by=current_user.id,
    )
    await chat.insert()
    return ChatSummary(
        id=str(chat.id),
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
    )


async def list_chats(current_user: CurrentUser) -> list[ChatSummary]:
    chats = await Chat.find(
        Chat.workspace_id == PydanticObjectId(current_user.workspace_id),
        Chat.created_by == current_user.id,
    ).sort(-Chat.updated_at).to_list()
    return [
        ChatSummary(id=str(c.id), title=c.title, created_at=c.created_at, updated_at=c.updated_at)
        for c in chats
    ]


async def get_chat_messages(chat_id: str, current_user: CurrentUser) -> list[MessageResponse]:
    try:
        oid = PydanticObjectId(chat_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat = await Chat.get(oid)
    if not chat or str(chat.workspace_id) != current_user.workspace_id or chat.created_by != current_user.id:
        raise HTTPException(status_code=404, detail="Chat not found")

    msgs = await Message.find(Message.chat_id == oid).sort(Message.created_at).to_list()
    return [
        MessageResponse(
            id=str(m.id),
            role=m.role,
            content=m.content,
            citations=m.citations,
            created_at=m.created_at,
        )
        for m in msgs
    ]


async def delete_chat(chat_id: str, current_user: CurrentUser) -> dict:
    try:
        oid = PydanticObjectId(chat_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat = await Chat.get(oid)
    if not chat or str(chat.workspace_id) != current_user.workspace_id or chat.created_by != current_user.id:
        raise HTTPException(status_code=404, detail="Chat not found")

    await Message.find(Message.chat_id == oid).delete()
    await chat.delete()
    return {"deleted": True}


# ── Streaming chat (RAG) ─────────────────────────────────────────────────────

async def handle_chat(
    request: ChatRequest,
    current_user: CurrentUser,
) -> AsyncGenerator[str, None]:
    workspace_id = current_user.workspace_id

    # Verify chat belongs to this user
    try:
        chat_oid = PydanticObjectId(request.chat_id)
    except Exception:
        error_event = _json.dumps({"error": "Invalid chat ID.", "done": True})
        yield f"data: {error_event}\n\n"
        return

    chat = await Chat.get(chat_oid)
    if not chat or str(chat.workspace_id) != workspace_id or chat.created_by != current_user.id:
        error_event = _json.dumps({"error": "Chat not found.", "done": True})
        yield f"data: {error_event}\n\n"
        return

    # Save user message
    user_msg = Message(
        chat_id=chat_oid,
        workspace_id=PydanticObjectId(workspace_id),
        role="user",
        content=request.query,
    )
    await user_msg.insert()

    # Auto-title from first user message
    msg_count = await Message.find(Message.chat_id == chat_oid, Message.role == "user").count()
    if msg_count == 1:
        title = request.query[:60].strip()
        if len(request.query) > 60:
            title += "…"
        await chat.set({"title": title, "updated_at": datetime.now(timezone.utc)})
    else:
        await chat.set({"updated_at": datetime.now(timezone.utc)})

    logger.info(
        "Chat request",
        user_id=current_user.id,
        workspace_id=workspace_id,
        chat_id=request.chat_id,
        query_len=len(request.query),
    )

    retrieved_doc_ids: list[str] = []
    response_tokens: list[str] = []
    final_citations: list[dict] = []

    try:
        async for sse_data, doc_ids in run_rag_chain(
            query=request.query,
            workspace_id=workspace_id,
            document_ids=request.document_ids,
        ):
            if doc_ids is not None:
                retrieved_doc_ids = doc_ids

            # Buffer for saving
            try:
                parsed = _json.loads(sse_data)
                if "token" in parsed:
                    response_tokens.append(parsed["token"])
                if "citations" in parsed:
                    final_citations = parsed.get("citations", [])
            except Exception:
                pass

            yield f"data: {sse_data}\n\n"

    except Exception as exc:
        logger.error("RAG chain failed", error=str(exc), workspace_id=workspace_id)
        error_event = _json.dumps({"error": "The AI service encountered an error. Please try again.", "done": True})
        yield f"data: {error_event}\n\n"

    finally:
        # Save assistant message
        if response_tokens:
            try:
                assistant_msg = Message(
                    chat_id=chat_oid,
                    workspace_id=PydanticObjectId(workspace_id),
                    role="assistant",
                    content="".join(response_tokens),
                    citations=final_citations if isinstance(final_citations, list) else [],
                )
                await assistant_msg.insert()
            except Exception as e:
                logger.warning("Failed to save assistant message", error=str(e))

        # Audit log
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
