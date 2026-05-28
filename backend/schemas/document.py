from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    document_id: str
    status: str = "processing"
    message: str = "File accepted. Processing has started in the background."


class DocumentStatusResponse(BaseModel):
    document_id: str
    original_filename: str
    status: Literal["pending", "processing", "completed", "failed"]
    chunk_count: int | None
    error_message: str | None


class DocumentListItem(BaseModel):
    document_id: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    tags: list[str]
    status: Literal["pending", "processing", "completed", "failed"]
    chunk_count: int | None
    created_at: datetime


class DocumentDeleteResponse(BaseModel):
    message: str
