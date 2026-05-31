from datetime import datetime, timezone
from beanie import Document, PydanticObjectId
from pymongo import IndexModel
from pydantic import Field


class NotionIntegration(Document):
    workspace_id: PydanticObjectId
    notion_token: str
    bot_id: str
    workspace_name: str
    connected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "notion_integrations"
        indexes = [IndexModel("workspace_id", unique=True)]
