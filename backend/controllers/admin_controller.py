"""Admin authentication and metrics."""

import random
import string
from collections import defaultdict
from datetime import datetime, timezone

from fastapi import HTTPException, status

from config.env import settings
from middleware.admin_auth import (
    create_admin_token,
    get_active_users,
    store_otp,
    verify_otp,
)
from models.chat import Chat
from models.document import UploadedDocument
from models.message import Message
from models.user import User
from models.workspace import Workspace
from schemas.admin import (
    AdminLoginRequest,
    AdminMetrics,
    AdminOTPRequest,
    AdminTokenResponse,
    DailyCount,
    DocTypeCount,
    StorageByWorkspace,
    UserMetric,
    WorkspaceMetric,
)
from services.email.resend_client import send_otp_email
from utils.logger import get_logger

logger = get_logger(__name__)


def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


async def admin_login(req: AdminLoginRequest) -> dict:
    """Validate credentials and send OTP."""
    if req.email.lower() != settings.ADMIN_EMAIL.lower():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    if req.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    otp = _generate_otp()
    store_otp(req.email.lower(), otp)

    sent = await send_otp_email(req.email, otp)
    if not sent:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Failed to send OTP. Try again.")

    logger.info("Admin OTP sent", email=req.email)
    return {"message": "OTP sent to your email."}


async def admin_verify_otp(req: AdminOTPRequest) -> AdminTokenResponse:
    """Verify OTP and issue admin JWT."""
    if req.email.lower() != settings.ADMIN_EMAIL.lower():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    if not verify_otp(req.email.lower(), req.otp):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired OTP.")

    token = create_admin_token()
    logger.info("Admin logged in", email=req.email)
    return AdminTokenResponse(access_token=token)


async def get_admin_metrics() -> AdminMetrics:
    """Aggregate all platform metrics."""

    # ── Fetch raw data ────────────────────────────────────────────────────────
    all_users      = await User.find().to_list()
    all_workspaces = await Workspace.find().to_list()
    all_docs       = await UploadedDocument.find().to_list()
    all_chats      = await Chat.find().to_list()
    all_messages   = await Message.find().to_list()

    # ── Index helpers ─────────────────────────────────────────────────────────
    ws_by_id   = {str(w.id): w for w in all_workspaces}
    user_by_id = {str(u.id): u for u in all_users}

    # Docs per workspace
    docs_per_ws: dict[str, list] = defaultdict(list)
    for d in all_docs:
        docs_per_ws[str(d.workspace_id)].append(d)

    # Members per workspace
    members_per_ws: dict[str, list] = defaultdict(list)
    for u in all_users:
        members_per_ws[str(u.workspace_id)].append(u)

    # Chats per workspace
    chats_per_ws: dict[str, int] = defaultdict(int)
    for c in all_chats:
        chats_per_ws[str(c.workspace_id)] += 1

    # ── Workspace metrics ─────────────────────────────────────────────────────
    workspace_metrics = []
    for w in all_workspaces:
        wid = str(w.id)
        docs = docs_per_ws[wid]
        owner = next((u for u in all_users if str(u.workspace_id) == wid and u.role == "owner"), None)
        workspace_metrics.append(WorkspaceMetric(
            id=wid,
            name=w.name,
            code=w.workspace_code,
            owner_email=owner.email if owner else "—",
            member_count=len(members_per_ws[wid]),
            document_count=len(docs),
            total_size_bytes=sum(d.file_size_bytes or 0 for d in docs),
            chat_count=chats_per_ws[wid],
            created_at=w.created_at,
        ))

    # ── User metrics ──────────────────────────────────────────────────────────
    user_metrics = []
    for u in all_users:
        ws = ws_by_id.get(str(u.workspace_id))
        user_metrics.append(UserMetric(
            id=str(u.id),
            email=u.email,
            role=u.role,
            workspace_id=str(u.workspace_id),
            workspace_code=ws.workspace_code if ws else "—",
            workspace_name=ws.name if ws else "—",
            created_at=u.created_at,
        ))

    # ── Time-series (last 14 days) ────────────────────────────────────────────
    def daily_counts(items, date_attr: str) -> list[DailyCount]:
        counts: dict[str, int] = defaultdict(int)
        for item in items:
            dt = getattr(item, date_attr, None)
            if dt:
                counts[dt.strftime("%Y-%m-%d")] += 1
        return [DailyCount(date=k, count=v) for k, v in sorted(counts.items())[-14:]]

    # ── Docs by type ──────────────────────────────────────────────────────────
    type_counts: dict[str, int] = defaultdict(int)
    for d in all_docs:
        type_counts[(d.file_type or "other").upper()] += 1
    docs_by_type = [DocTypeCount(file_type=k, count=v) for k, v in type_counts.items()]

    # ── Storage by workspace ──────────────────────────────────────────────────
    storage_by_ws = []
    for w in all_workspaces:
        wid = str(w.id)
        docs = docs_per_ws[wid]
        size_bytes = sum(d.file_size_bytes or 0 for d in docs)
        storage_by_ws.append(StorageByWorkspace(
            workspace_name=w.name,
            docs=len(docs),
            size_mb=round(size_bytes / (1024 * 1024), 2),
        ))

    # ── Active users ──────────────────────────────────────────────────────────
    active = get_active_users(window_seconds=900)

    return AdminMetrics(
        total_users=len(all_users),
        total_workspaces=len(all_workspaces),
        total_documents=len(all_docs),
        total_chats=len(all_chats),
        total_messages=len(all_messages),
        total_storage_bytes=sum(d.file_size_bytes or 0 for d in all_docs),
        active_users_count=len(active),
        active_users=active,
        users=user_metrics,
        workspaces=workspace_metrics,
        users_over_time=daily_counts(all_users, "created_at"),
        docs_over_time=daily_counts(all_docs, "created_at"),
        chats_over_time=daily_counts(all_chats, "created_at"),
        docs_by_type=docs_by_type,
        storage_by_workspace=storage_by_ws,
    )
