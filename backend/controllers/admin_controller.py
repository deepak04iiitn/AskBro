"""Admin authentication and metrics."""

import asyncio
import random
import string
from collections import defaultdict
from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson import ObjectId
from fastapi import HTTPException, status
from qdrant_client.models import FieldCondition, Filter, MatchValue

from config.env import settings
from middleware.admin_auth import (
    create_admin_token,
    get_active_users,
    store_otp,
    verify_otp,
)
from models.chat import Chat
from models.chunk import Chunk
from models.document import UploadedDocument
from models.github_integration import GitHubIntegration
from models.github_repo import GitHubRepo
from models.message import Message
from models.notion_integration import NotionIntegration
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


# ── Admin: delete user ────────────────────────────────────────────────────────

async def delete_user(user_id: str) -> dict:
    """Remove a single user record. The workspace itself is left intact."""
    try:
        oid = PydanticObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    user = await User.get(oid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    await user.delete()
    logger.info("Admin deleted user", user_id=user_id, email=user.email)
    return {"message": f"User {user.email} deleted."}


# ── Admin: delete workspace (full cascade) ───────────────────────────────────

async def delete_workspace(workspace_id: str) -> dict:
    """
    Delete a workspace and ALL associated data:
      Users, Documents (+ GridFS files), Chunks (+ Qdrant vectors),
      Chats, Messages, NotionIntegration, GitHubIntegration, GitHubRepo.
    Errors in external services (GridFS, Qdrant) are logged but do not abort.
    """
    try:
        oid = PydanticObjectId(workspace_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid workspace ID.")

    workspace = await Workspace.get(oid)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found.")

    ws_id_str = workspace_id

    # ── 1. Gather documents to clean up GridFS + Qdrant ───────────────────────
    docs = await UploadedDocument.find(
        UploadedDocument.workspace_id == oid
    ).to_list()

    # ── 2. Delete GridFS files (best-effort) ──────────────────────────────────
    from config.storage import get_gridfs_bucket
    bucket = get_gridfs_bucket()

    async def _delete_gridfs(gridfs_id: str) -> None:
        try:
            await bucket.delete(ObjectId(gridfs_id))
        except Exception as exc:
            logger.warning("GridFS delete failed", gridfs_id=gridfs_id, exc=str(exc))

    await asyncio.gather(*[
        _delete_gridfs(d.gridfs_file_id)
        for d in docs
        if d.gridfs_file_id and d.gridfs_file_id != "pending"
    ])

    # ── 3. Delete Qdrant vectors by workspaceId (single bulk call) ────────────
    try:
        from services.vectorstore.qdrant_client import get_qdrant_client
        qdrant = get_qdrant_client()
        qdrant.delete(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            points_selector=Filter(
                must=[FieldCondition(key="workspaceId", match=MatchValue(value=ws_id_str))]
            ),
        )
    except Exception as exc:
        logger.warning("Qdrant workspace delete failed (skipping)", workspace_id=ws_id_str, exc=str(exc))

    # ── 4. Cascade-delete all MongoDB collections in parallel ─────────────────
    await asyncio.gather(
        User.find(User.workspace_id == oid).delete(),
        UploadedDocument.find(UploadedDocument.workspace_id == oid).delete(),
        Chunk.find(Chunk.workspace_id == oid).delete(),
        Chat.find(Chat.workspace_id == oid).delete(),
        Message.find(Message.workspace_id == oid).delete(),
        NotionIntegration.find(NotionIntegration.workspace_id == oid).delete(),
        GitHubIntegration.find(GitHubIntegration.workspace_id == oid).delete(),
        GitHubRepo.find(GitHubRepo.workspace_id == oid).delete(),
    )

    # ── 5. Delete workspace itself ────────────────────────────────────────────
    await workspace.delete()

    logger.info("Admin deleted workspace", workspace_id=ws_id_str, name=workspace.name)
    return {"message": f"Workspace '{workspace.name}' and all associated data deleted."}
