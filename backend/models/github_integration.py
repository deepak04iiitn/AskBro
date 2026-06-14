from datetime import datetime, timezone
from typing import Literal

from beanie import Document, PydanticObjectId
from pymongo import IndexModel
from pydantic import Field


class GitHubIntegration(Document):
    workspace_id: PydanticObjectId
    github_user_id: str
    github_username: str
    avatar_url: str = ""
    access_token: str                            # encrypted via Fernet
    token_type: Literal["oauth", "pat"] = "pat"
    scopes: list[str] = Field(default_factory=list)
    connected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "github_integrations"
        indexes = [IndexModel("workspace_id", unique=True)]
