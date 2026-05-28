from datetime import datetime, timezone
from typing import Literal

from beanie import Document, PydanticObjectId
from pymongo import IndexModel
from pydantic import Field


class AuditLog(Document):
    user_id: PydanticObjectId
    workspace_id: PydanticObjectId
    action: Literal["query", "upload", "delete", "login"]
    query_text: str | None = None
    retrieved_document_ids: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "audit_logs"
        indexes = [
            # Most queries will be: "show logs for workspace X, sorted newest first"
            IndexModel([("workspace_id", 1), ("created_at", -1)]),
            IndexModel([("workspace_id", 1), ("action", 1)]),
        ]
