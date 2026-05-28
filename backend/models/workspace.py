import secrets
import string
from datetime import datetime, timezone

from beanie import Document
from pymongo import IndexModel
from pydantic import Field


def _generate_workspace_code() -> str:
    """Generate a human-readable unique code like WSP-A3F9."""
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(chars) for _ in range(4))
    return f"WSP-{suffix}"


class Workspace(Document):
    name: str
    workspace_code: str = Field(default_factory=_generate_workspace_code)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "workspaces"
        indexes = [
            IndexModel("workspace_code", unique=True),
        ]
