from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000, description="User question")
    document_ids: list[str] | None = Field(
        default=None,
        description="Optional list of document IDs to restrict retrieval to",
    )


class CitationSchema(BaseModel):
    documentId: str
    fileName: str | None = None


class ChatDoneEvent(BaseModel):
    citations: list[CitationSchema]
    done: bool = True


class ChatTokenEvent(BaseModel):
    token: str
    done: bool = False
