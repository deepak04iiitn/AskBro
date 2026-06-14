from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse

from controllers.github_controller import (
    github_connect_pat,
    github_disconnect,
    github_get_repo_status,
    github_import_repo,
    github_list_imported_repos,
    github_list_repos,
    github_oauth_callback,
    github_oauth_start,
    github_remove_repo,
    github_status,
    github_sync_repo,
)
from middleware.auth import get_current_user
from middleware.rbac import require_owner
from schemas.github_schemas import (
    GitHubOAuthStartResponse,
    GitHubPATConnectRequest,
    GitHubStatusResponse,
    RepoImportRequest,
    RepoImportResponse,
    RepoListItem,
    RepoStatusResponse,
    RepoSyncRequest,
)
from schemas.user import CurrentUser

router = APIRouter(prefix="/github", tags=["github"])


# ── Auth ──────────────────────────────────────────────────────────────────────

@router.get("/oauth/start", response_model=GitHubOAuthStartResponse)
async def oauth_start(current_user: CurrentUser = Depends(get_current_user)):
    return await github_oauth_start(current_user)


@router.get("/oauth/callback")
async def oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
):
    return await github_oauth_callback(code, state)


@router.post("/connect/pat", response_model=dict)
async def connect_pat(
    req: GitHubPATConnectRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await github_connect_pat(req, current_user)


@router.get("/status", response_model=GitHubStatusResponse)
async def status(current_user: CurrentUser = Depends(get_current_user)):
    return await github_status(current_user)


@router.delete("/disconnect", response_model=dict)
async def disconnect(current_user: CurrentUser = Depends(require_owner)):
    return await github_disconnect(current_user)


# ── Repos ─────────────────────────────────────────────────────────────────────

@router.get("/repos/available", response_model=list[RepoListItem])
async def list_available_repos(current_user: CurrentUser = Depends(get_current_user)):
    """List all repos accessible to the connected GitHub account."""
    return await github_list_repos(current_user)


@router.get("/repos/branches", response_model=list[str])
async def list_repo_branches(
    owner: str,
    repo: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    """List branch names for a specific repo."""
    from controllers.github_controller import github_list_branches
    return await github_list_branches(owner, repo, current_user)


@router.get("/repos", response_model=list[RepoStatusResponse])
async def list_imported_repos(current_user: CurrentUser = Depends(get_current_user)):
    """List all repos that have been imported into this workspace."""
    return await github_list_imported_repos(current_user)


@router.post("/repos/import", response_model=RepoImportResponse)
async def import_repo(
    req: RepoImportRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await github_import_repo(req, current_user)


@router.get("/repos/{repo_id}", response_model=RepoStatusResponse)
async def get_repo_status(
    repo_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await github_get_repo_status(repo_id, current_user)


@router.post("/repos/{repo_id}/sync", response_model=dict)
async def sync_repo(
    repo_id: str,
    req: RepoSyncRequest = RepoSyncRequest(),
    current_user: CurrentUser = Depends(get_current_user),
):
    return await github_sync_repo(repo_id, req, current_user)


@router.delete("/repos/{repo_id}", response_model=dict)
async def remove_repo(
    repo_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await github_remove_repo(repo_id, current_user)
