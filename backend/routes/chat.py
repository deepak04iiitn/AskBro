from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from controllers.chat_controller import handle_chat
from middleware.auth import get_current_user
from schemas.chat import ChatRequest
from schemas.user import CurrentUser

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post(
    "",
    summary="Ask a question (SSE stream)",
    response_description="Server-Sent Events stream of token and citation events",
)
async def chat(
    request: ChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> StreamingResponse:
    """
    Stream an AI-generated answer for the given query.

    Each SSE event is one of:
    - `data: {"token": "...", "done": false}` — a text token from the LLM
    - `data: {"citations": [...], "done": true}` — final event with source citations
    """
    return StreamingResponse(
        handle_chat(request, current_user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable nginx proxy buffering
        },
    )
