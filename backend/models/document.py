from datetime import datetime, timezone
from typing import Literal

from beanie import Document, PydanticObjectId
from pymongo import IndexModel
from pydantic import Field


class UploadedDocument(Document):
    """
    Metadata record for an uploaded document.
    The raw file bytes live in MongoDB GridFS; this record holds the reference.
    Named UploadedDocument to avoid collision with beanie's own Document base class.
    """

    workspace_id: PydanticObjectId
    uploaded_by: PydanticObjectId          # ref to User._id
    original_filename: str
    gridfs_file_id: str                    # str representation of GridFS ObjectId
    file_type: Literal["pdf", "docx", "md", "txt"]
    file_size_bytes: int
    tags: list[str] = Field(default_factory=list)
    status: Literal["pending", "processing", "completed", "failed"] = "pending"
    error_message: str | None = None
    chunk_count: int | None = None         # populated after ingestion completes
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "documents"
        indexes = [
            IndexModel([("workspace_id", 1), ("status", 1)]),
            IndexModel([("workspace_id", 1), ("tags", 1)]),
            IndexModel([("workspace_id", 1), ("created_at", -1)]),
        ]
