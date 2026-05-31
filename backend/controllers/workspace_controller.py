import bcrypt
from fastapi import HTTPException, status

from middleware.auth import create_access_token
from models.user import User
from models.workspace import Workspace
from schemas.user import CurrentUser
from schemas.workspace import (
    AddMemberRequest,
    ChangePasswordRequest,
    ForgotCodeRequest,
    LoginRequest,
    RemoveMemberRequest,
    WorkspaceCreateRequest,
    WorkspaceCreateResponse,
    WorkspaceMemberResponse,
    TokenResponse,
)


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── Create workspace ──────────────────────────────────────────────────────────

async def create_workspace(req: WorkspaceCreateRequest) -> WorkspaceCreateResponse:
    hashed = _hash_password(req.password)
    workspace = Workspace(name=req.name, hashed_password=hashed)
    await workspace.insert()

    # Insert owner
    await User(email=req.owner_email, workspace_id=workspace.id, role="owner").insert()

    # Insert members (skip if same as owner)
    for email in req.member_emails:
        if email == req.owner_email:
            continue
        existing = await User.find_one(
            User.workspace_id == workspace.id,
            User.email == email,
        )
        if not existing:
            await User(email=email, workspace_id=workspace.id, role="member").insert()

    return WorkspaceCreateResponse(
        workspace_code=workspace.workspace_code,
        message=f"Workspace '{req.name}' created. Share the code '{workspace.workspace_code}' with your team.",
    )


# ── Login ─────────────────────────────────────────────────────────────────────

async def login(req: LoginRequest) -> TokenResponse:
    # 1. Find workspace by its public code
    workspace = await Workspace.find_one(Workspace.workspace_code == req.workspace_code)
    if not workspace:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Workspace code not found.")

    # 2. Verify email belongs to this workspace
    user = await User.find_one(
        User.workspace_id == workspace.id,
        User.email == req.email,
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="This email is not a member of that workspace.")

    # 4. Issue JWT
    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "workspace_id": str(workspace.id),
        "workspace_code": workspace.workspace_code,
        "role": user.role,
    })
    return TokenResponse(access_token=token)


# ── Member management (owner only) ────────────────────────────────────────────

async def add_member(req: AddMemberRequest, current_user: CurrentUser) -> dict:
    from beanie import PydanticObjectId
    ws_id = PydanticObjectId(current_user.workspace_id)
    existing = await User.find_one(
        User.workspace_id == ws_id,
        User.email == req.email,
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User is already a member.")

    await User(
        email=req.email,
        workspace_id=ws_id,
        role="member",
    ).insert()
    return {"message": f"{req.email} added to workspace."}


async def remove_member(req: RemoveMemberRequest, current_user: CurrentUser) -> dict:
    from beanie import PydanticObjectId
    user = await User.find_one(
        User.workspace_id == PydanticObjectId(current_user.workspace_id),
        User.email == req.email,
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")
    if user.role == "owner":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove the workspace owner.")

    await user.delete()
    return {"message": f"{req.email} removed from workspace."}


async def list_members(current_user: CurrentUser) -> list[WorkspaceMemberResponse]:
    from beanie import PydanticObjectId
    users = await User.find(
        User.workspace_id == PydanticObjectId(current_user.workspace_id)
    ).to_list()
    return [WorkspaceMemberResponse(email=u.email, role=u.role) for u in users]


# ── Change password (owner only) ──────────────────────────────────────────────

async def change_password(req: ChangePasswordRequest, current_user: CurrentUser) -> dict:
    from beanie import PydanticObjectId
    workspace = await Workspace.get(PydanticObjectId(current_user.workspace_id))
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found.")

    workspace.hashed_password = _hash_password(req.new_password)
    await workspace.save()
    return {"message": "Password updated successfully."}


# ── Forgot workspace code ─────────────────────────────────────────────────────

async def forgot_workspace_code(req: ForgotCodeRequest) -> dict:
    from services.email.resend_client import send_forgot_code_email

    # Find all users with this email (one per workspace they belong to)
    users = await User.find(User.email == req.email.lower()).to_list()

    if not users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with that email address.",
        )

    # Try to find a workspace where the password matches
    matched_user = None
    matched_workspace = None
    for user in users:
        workspace = await Workspace.get(user.workspace_id)
        if workspace and _verify_password(req.password, workspace.hashed_password):
            matched_user = user
            matched_workspace = workspace
            break

    if not matched_user or not matched_workspace:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Check role
    if matched_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are a member of this workspace, not the owner. "
                "Only the workspace owner can retrieve the workspace code. "
                "Please contact your workspace owner directly."
            ),
        )

    # Send notification email to admin
    sent = await send_forgot_code_email(
        requester_email=req.email,
        workspace_name=matched_workspace.name,
        workspace_code=matched_workspace.workspace_code,
    )

    if not sent:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not send notification. Please try again later.",
        )

    return {
        "message": (
            "Your request has been sent to our admin. "
            "They will contact you shortly with your workspace code."
        )
    }


# ── Leave / delete account ────────────────────────────────────────────────────

async def leave_workspace(current_user: CurrentUser) -> dict:
    """
    Members  → removes only their user record.
    Owners   → allowed only if they are the sole member; triggers full workspace deletion.
    """
    from beanie import PydanticObjectId
    from models.chat import Chat
    from models.chunk import Chunk
    from models.document import UploadedDocument
    from models.message import Message
    from services.vectorstore.qdrant_client import get_qdrant_client
    from config.env import settings
    from utils.logger import get_logger

    logger = get_logger(__name__)

    workspace_id = PydanticObjectId(current_user.workspace_id)
    user = await User.get(PydanticObjectId(current_user.id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.role == "owner":
        other_count = await User.find(
            User.workspace_id == workspace_id,
            User.id != user.id,
        ).count()

        if other_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"You are the workspace owner and there are still {other_count} "
                    "other member(s). Remove all members before deleting your account, "
                    "or ask a member to take over."
                ),
            )

        # ── Owner is the last person — cascade delete everything ──────────
        workspace = await Workspace.get(workspace_id)

        # 1. Collect Qdrant point IDs before deleting chunks
        try:
            chunks = await Chunk.find(Chunk.workspace_id == workspace_id).to_list()
            point_ids = [c.qdrant_point_id for c in chunks if c.qdrant_point_id]
            if point_ids:
                qdrant = get_qdrant_client()
                qdrant.delete(
                    collection_name=settings.QDRANT_COLLECTION_NAME,
                    points_selector=point_ids,
                )
        except Exception as exc:
            logger.warning("Qdrant cleanup failed during workspace deletion", error=str(exc))

        # 2. MongoDB cascade
        await Message.find(Message.workspace_id == workspace_id).delete()
        await Chat.find(Chat.workspace_id == workspace_id).delete()
        await Chunk.find(Chunk.workspace_id == workspace_id).delete()
        await UploadedDocument.find(UploadedDocument.workspace_id == workspace_id).delete()
        await user.delete()
        if workspace:
            await workspace.delete()

        logger.info("Workspace deleted by owner", workspace_id=str(workspace_id))
        return {"message": "Your account and workspace have been permanently deleted.", "action": "workspace_deleted"}

    else:
        # ── Member leaves ─────────────────────────────────────────────────
        await user.delete()
        return {"message": "You have successfully left the workspace.", "action": "left"}
