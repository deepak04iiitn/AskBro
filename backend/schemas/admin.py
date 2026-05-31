from datetime import datetime
from pydantic import BaseModel, EmailStr


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Metrics schemas ───────────────────────────────────────────────────────────

class WorkspaceMetric(BaseModel):
    id: str
    name: str
    code: str
    owner_email: str
    member_count: int
    document_count: int
    total_size_bytes: int
    chat_count: int
    created_at: datetime


class UserMetric(BaseModel):
    id: str
    email: str
    role: str
    workspace_id: str
    workspace_code: str
    workspace_name: str
    created_at: datetime


class DailyCount(BaseModel):
    date: str  # YYYY-MM-DD
    count: int


class DocTypeCount(BaseModel):
    file_type: str
    count: int


class StorageByWorkspace(BaseModel):
    workspace_name: str
    docs: int
    size_mb: float


class AdminMetrics(BaseModel):
    # Totals
    total_users: int
    total_workspaces: int
    total_documents: int
    total_chats: int
    total_messages: int
    total_storage_bytes: int

    # Active
    active_users_count: int
    active_users: list[dict]

    # Lists
    users: list[UserMetric]
    workspaces: list[WorkspaceMetric]

    # Charts
    users_over_time: list[DailyCount]
    docs_over_time: list[DailyCount]
    chats_over_time: list[DailyCount]
    docs_by_type: list[DocTypeCount]
    storage_by_workspace: list[StorageByWorkspace]
