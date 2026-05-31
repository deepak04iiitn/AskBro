from datetime import datetime
from pydantic import BaseModel


class NotionConnectRequest(BaseModel):
    token: str


class NotionImportRequest(BaseModel):
    page_url: str
    file_name: str


class NotionStatusResponse(BaseModel):
    connected: bool
    workspace_name: str | None = None
    bot_id: str | None = None
    connected_at: datetime | None = None


class NotionImportResponse(BaseModel):
    file_name: str
    content: str
    page_title: str
    char_count: int
