from datetime import datetime
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000, description="User question")
    chat_id: str = Field(..., description="Chat session ID — create via POST /chats first")
    document_ids: list[str] | None = Field(default=None)


class CitationSchema(BaseModel):
    documentId: str
    fileName: str | None = None


class ChatDoneEvent(BaseModel):
    citations: list[CitationSchema]
    done: bool = True


class ChatTokenEvent(BaseModel):
    token: str
    done: bool = False


class ChatSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    citations: list[dict] = []
    created_at: datetime
