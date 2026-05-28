from datetime import datetime, timezone
from typing import Literal

from beanie import Document, PydanticObjectId
from pymongo import IndexModel
from pydantic import Field


class User(Document):
    email: str
    workspace_id: PydanticObjectId
    role: Literal["owner", "member"] = "member"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            # One email per workspace — enforces isolation across workspaces
            IndexModel([("workspace_id", 1), ("email", 1)], unique=True),
        ]
