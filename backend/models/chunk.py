from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pymongo import IndexModel
from pydantic import Field


class Chunk(Document):
    document_id: PydanticObjectId
    workspace_id: PydanticObjectId
    qdrant_point_id: str               # UUID string that matches the point ID in Qdrant
    chunk_index: int                   # 0-based position within the document
    page_number: int | None = None     # available for PDFs; None for plain text/md
    text_preview: str                  # first 200 chars — useful for debugging
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "chunks"
        indexes = [
            IndexModel("document_id"),
            IndexModel("workspace_id"),
            IndexModel("qdrant_point_id", unique=True),
        ]
