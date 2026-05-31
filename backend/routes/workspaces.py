from fastapi import APIRouter, Depends, Request
from middleware.rate_limit import limiter, AUTH_LIMIT

from controllers.workspace_controller import (
    add_member,
    change_password,
    create_workspace,
    forgot_workspace_code,
    list_members,
    login,
    remove_member,
)
from middleware.auth import get_current_user
from middleware.rbac import require_owner
from schemas.user import CurrentUser
from schemas.workspace import (
    AddMemberRequest,
    ChangePasswordRequest,
    ForgotCodeRequest,
    LoginRequest,
    RemoveMemberRequest,
    TokenResponse,
    WorkspaceCreateRequest,
    WorkspaceCreateResponse,
    WorkspaceMemberResponse,
)

router = APIRouter(prefix="/workspaces")


@router.post("/create", response_model=WorkspaceCreateResponse, status_code=201)
@limiter.limit(AUTH_LIMIT)
async def create_workspace_route(request: Request, req: WorkspaceCreateRequest):
    return await create_workspace(req)


@router.post("/auth/login", response_model=TokenResponse)
@limiter.limit(AUTH_LIMIT)
async def login_route(request: Request, req: LoginRequest):
    return await login(req)


@router.get("/members", response_model=list[WorkspaceMemberResponse])
async def list_members_route(current_user: CurrentUser = Depends(get_current_user)):
    return await list_members(current_user)


@router.post("/members/add", response_model=dict)
async def add_member_route(
    req: AddMemberRequest,
    current_user: CurrentUser = Depends(require_owner),
):
    return await add_member(req, current_user)


@router.delete("/members/{email}", response_model=dict)
async def remove_member_route(
    email: str,
    current_user: CurrentUser = Depends(require_owner),
):
    req = RemoveMemberRequest(email=email)
    return await remove_member(req, current_user)


@router.put("/password", response_model=dict)
async def change_password_route(
    req: ChangePasswordRequest,
    current_user: CurrentUser = Depends(require_owner),
):
    return await change_password(req, current_user)


@router.post("/forgot-code", response_model=dict)
@limiter.limit(AUTH_LIMIT)
async def forgot_code_route(request: Request, req: ForgotCodeRequest):
    return await forgot_workspace_code(req)
