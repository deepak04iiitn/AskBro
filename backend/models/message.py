from datetime import datetime, timezone
from typing import Literal
from beanie import Document, PydanticObjectId
from pymongo import IndexModel
from pydantic import Field


class Message(Document):
    chat_id: PydanticObjectId
    workspace_id: PydanticObjectId
    role: Literal["user", "assistant"]
    content: str
    citations: list[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "messages"
        indexes = [
            IndexModel([("chat_id", 1), ("created_at", 1)]),
        ]
