from datetime import datetime, timezone
from beanie import Document, PydanticObjectId
from pymongo import IndexModel
from pydantic import Field


class Chat(Document):
    workspace_id: PydanticObjectId
    created_by: str  # user id (current_user.id)
    title: str = "New chat"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "chats"
        indexes = [
            IndexModel([("workspace_id", 1), ("created_by", 1), ("updated_at", -1)]),
        ]
