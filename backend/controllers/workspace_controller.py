import bcrypt
from fastapi import HTTPException, status

from middleware.auth import create_access_token
from models.user import User
from models.workspace import Workspace
from schemas.user import CurrentUser
from schemas.workspace import (
    AddMemberRequest,
    ChangePasswordRequest,
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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid workspace code or password.")

    # 2. Verify password
    if not _verify_password(req.password, workspace.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid workspace code or password.")

    # 3. Verify email belongs to this workspace
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
    existing = await User.find_one(
        User.workspace_id == current_user.workspace_id,
        User.email == req.email,
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User is already a member.")

    from beanie import PydanticObjectId
    await User(
        email=req.email,
        workspace_id=PydanticObjectId(current_user.workspace_id),
        role="member",
    ).insert()
    return {"message": f"{req.email} added to workspace."}


async def remove_member(req: RemoveMemberRequest, current_user: CurrentUser) -> dict:
    user = await User.find_one(
        User.workspace_id == current_user.workspace_id,
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
