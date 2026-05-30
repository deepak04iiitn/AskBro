from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from controllers.chat_controller import (
    create_chat,
    delete_chat,
    get_chat_messages,
    handle_chat,
    list_chats,
)
from middleware.auth import get_current_user
from schemas.chat import ChatRequest, ChatSummary, MessageResponse
from schemas.user import CurrentUser

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/chats", response_model=ChatSummary, status_code=201)
async def create_chat_route(current_user: CurrentUser = Depends(get_current_user)):
    return await create_chat(current_user)


@router.get("/chats", response_model=list[ChatSummary])
async def list_chats_route(current_user: CurrentUser = Depends(get_current_user)):
    return await list_chats(current_user)


@router.get("/chats/{chat_id}/messages", response_model=list[MessageResponse])
async def get_messages_route(
    chat_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_chat_messages(chat_id, current_user)


@router.delete("/chats/{chat_id}")
async def delete_chat_route(
    chat_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await delete_chat(chat_id, current_user)


@router.post("", summary="Ask a question (SSE stream)")
async def chat_route(
    request: ChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> StreamingResponse:
    return StreamingResponse(
        handle_chat(request, current_user),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
