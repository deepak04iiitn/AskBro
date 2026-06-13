"""GitHub integration controller."""

import secrets
from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import HTTPException, status
from fastapi.responses import RedirectResponse

from config.env import settings
from models.github_integration import GitHubIntegration
from models.github_repo import GitHubRepo
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
from services.github.client import (
    build_oauth_url,
    exchange_oauth_code,
    get_repo,
    list_repos,
    verify_token,
)
from utils.crypto import decrypt_github_token as decrypt_token, encrypt_github_token as encrypt_token
from utils.logger import get_logger

logger = get_logger(__name__)

# In-memory state store for OAuth CSRF tokens (good enough for single-instance)
_oauth_states: dict[str, str] = {}   # state → workspace_id


# ── Authentication ────────────────────────────────────────────────────────────

async def github_oauth_start(current_user: CurrentUser) -> GitHubOAuthStartResponse:
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(status_code=501, detail="GitHub OAuth is not configured.")

    state = secrets.token_urlsafe(32)
    _oauth_states[state] = current_user.workspace_id

    redirect_uri = f"{settings.BACKEND_URL}/api/v1/github/oauth/callback"
    url = build_oauth_url(settings.GITHUB_CLIENT_ID, state, redirect_uri)
    return GitHubOAuthStartResponse(redirect_url=url)


async def github_oauth_callback(code: str, state: str) -> RedirectResponse:
    workspace_id_str = _oauth_states.pop(state, None)
    if not workspace_id_str:
        return RedirectResponse(f"{settings.FRONTEND_URL}/integrations?github=error&reason=invalid_state")

    try:
        token_data = await exchange_oauth_code(
            settings.GITHUB_CLIENT_ID, settings.GITHUB_CLIENT_SECRET, code
        )
    except Exception:
        return RedirectResponse(f"{settings.FRONTEND_URL}/integrations?github=error&reason=exchange_failed")

    access_token = token_data.get("access_token")
    if not access_token:
        return RedirectResponse(f"{settings.FRONTEND_URL}/integrations?github=error&reason=no_token")

    scopes = [s.strip() for s in token_data.get("scope", "").split(",") if s.strip()]

    try:
        user_info = await verify_token(access_token)
    except Exception:
        return RedirectResponse(f"{settings.FRONTEND_URL}/integrations?github=error&reason=verify_failed")

    await _store_integration(
        workspace_id_str=workspace_id_str,
        token=access_token,
        token_type="oauth",
        scopes=scopes,
        user_info=user_info,
    )

    return RedirectResponse(f"{settings.FRONTEND_URL}/integrations?github=connected")


async def github_connect_pat(req: GitHubPATConnectRequest, current_user: CurrentUser) -> dict:
    token = req.token.strip()
    try:
        user_info = await verify_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid GitHub token. Make sure it has 'repo' and 'read:user' scopes.",
        )

    await _store_integration(
        workspace_id_str=current_user.workspace_id,
        token=token,
        token_type="pat",
        scopes=[],
        user_info=user_info,
    )

    return {"message": "GitHub connected.", "github_username": user_info.get("login")}


async def github_status(current_user: CurrentUser) -> GitHubStatusResponse:
    ws_id = PydanticObjectId(current_user.workspace_id)
    rec = await GitHubIntegration.find_one(GitHubIntegration.workspace_id == ws_id)
    if not rec:
        return GitHubStatusResponse(connected=False)
    return GitHubStatusResponse(
        connected=True,
        github_username=rec.github_username,
        avatar_url=rec.avatar_url,
        token_type=rec.token_type,
        connected_at=rec.connected_at,
    )


async def github_disconnect(current_user: CurrentUser) -> dict:
    ws_id = PydanticObjectId(current_user.workspace_id)
    rec = await GitHubIntegration.find_one(GitHubIntegration.workspace_id == ws_id)
    if rec:
        await rec.delete()
    return {"message": "GitHub disconnected."}


# ── Repos ─────────────────────────────────────────────────────────────────────

async def github_list_branches(owner: str, repo_name: str, current_user: CurrentUser) -> list[str]:
    integration = await _get_integration(current_user)
    token = decrypt_token(integration.access_token)
    from services.github.client import list_branches
    return await list_branches(token, owner, repo_name)


async def github_list_repos(current_user: CurrentUser) -> list[RepoListItem]:
    integration = await _get_integration(current_user)
    token = decrypt_token(integration.access_token)

    raw_repos = await list_repos(token)

    # Fetch already-imported repos to mark them
    ws_id = PydanticObjectId(current_user.workspace_id)
    imported = await GitHubRepo.find(GitHubRepo.workspace_id == ws_id).to_list()
    imported_names = {r.full_name for r in imported}

    return [
        RepoListItem(
            full_name=r["full_name"],
            owner=r["owner"]["login"],
            repo_name=r["name"],
            private=r.get("private", False),
            description=r.get("description") or "",
            default_branch=r.get("default_branch", "main"),
            already_imported=r["full_name"] in imported_names,
        )
        for r in raw_repos
    ]


async def github_import_repo(req: RepoImportRequest, current_user: CurrentUser) -> RepoImportResponse:
    integration = await _get_integration(current_user)
    ws_id = PydanticObjectId(current_user.workspace_id)

    full_name = f"{req.owner}/{req.repo_name}"

    # Verify the repo is accessible
    token = decrypt_token(integration.access_token)
    try:
        repo_info = await get_repo(token, req.owner, req.repo_name)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Repository '{full_name}' not found or not accessible with the connected token.",
        )

    # Upsert the GitHubRepo record
    existing = await GitHubRepo.find_one(
        GitHubRepo.workspace_id == ws_id,
        GitHubRepo.full_name == full_name,
    )
    if existing:
        # Re-import: reset state
        existing.status = "pending"
        existing.error_message = None
        existing.include_issues = req.include_issues
        existing.include_prs = req.include_prs
        existing.include_commits = req.include_commits
        existing.auto_sync = req.auto_sync
        existing.file_filters = req.filters
        existing.default_branch = req.branch
        existing.updated_at = datetime.now(timezone.utc)
        await existing.save()
        repo_doc = existing
    else:
        repo_doc = GitHubRepo(
            workspace_id=ws_id,
            integration_id=integration.id,
            owner=req.owner,
            repo_name=req.repo_name,
            full_name=full_name,
            private=repo_info.get("private", False),
            default_branch=req.branch,
            description=repo_info.get("description") or "",
            include_issues=req.include_issues,
            include_prs=req.include_prs,
            include_commits=req.include_commits,
            auto_sync=req.auto_sync,
            file_filters=req.filters,
        )
        await repo_doc.insert()

    # Enqueue the ingestion task
    from workers.github_ingestion_worker import ingest_github_repo
    ingest_github_repo.apply_async(args=[str(repo_doc.id)], queue="ingestion")

    logger.info("GitHub repo import enqueued", repo=full_name, workspace=str(ws_id))
    return RepoImportResponse(
        repo_id=str(repo_doc.id),
        full_name=full_name,
        message=f"Import started for {full_name}. This may take a few minutes.",
    )


async def github_get_repo_status(repo_id: str, current_user: CurrentUser) -> RepoStatusResponse:
    ws_id = PydanticObjectId(current_user.workspace_id)
    repo = await _get_repo(repo_id, ws_id)
    return _repo_to_status(repo)


async def github_list_imported_repos(current_user: CurrentUser) -> list[RepoStatusResponse]:
    ws_id = PydanticObjectId(current_user.workspace_id)
    repos = await GitHubRepo.find(GitHubRepo.workspace_id == ws_id).to_list()
    return [_repo_to_status(r) for r in repos]


async def github_sync_repo(repo_id: str, req: RepoSyncRequest, current_user: CurrentUser) -> dict:
    ws_id = PydanticObjectId(current_user.workspace_id)
    repo = await _get_repo(repo_id, ws_id)

    if repo.status in ("ingesting", "syncing"):
        raise HTTPException(status_code=409, detail="A sync is already in progress for this repo.")

    if req.force_full:
        repo.last_commit_sha = None   # forces full re-index

    repo.status = "pending"
    repo.updated_at = datetime.now(timezone.utc)
    await repo.save()

    from workers.github_ingestion_worker import ingest_github_repo
    ingest_github_repo.apply_async(args=[str(repo.id)], queue="ingestion")

    return {"message": f"Sync started for {repo.full_name}."}


async def github_remove_repo(repo_id: str, current_user: CurrentUser) -> dict:
    ws_id = PydanticObjectId(current_user.workspace_id)
    repo = await _get_repo(repo_id, ws_id)
    full_name = repo.full_name

    # Delete chunks from Qdrant and MongoDB
    from workers.cleanup_github_worker import cleanup_github_repo
    cleanup_github_repo.apply_async(args=[str(repo.id), str(ws_id)], queue="cleanup")

    await repo.delete()
    return {"message": f"Repository '{full_name}' removed. Content will be deleted shortly."}


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_integration(current_user: CurrentUser) -> GitHubIntegration:
    ws_id = PydanticObjectId(current_user.workspace_id)
    rec = await GitHubIntegration.find_one(GitHubIntegration.workspace_id == ws_id)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub is not connected. Connect it from the Integrations page first.",
        )
    return rec


async def _get_repo(repo_id: str, ws_id: PydanticObjectId) -> GitHubRepo:
    repo = await GitHubRepo.get(PydanticObjectId(repo_id))
    if not repo or repo.workspace_id != ws_id:
        raise HTTPException(status_code=404, detail="Repository not found.")
    return repo


async def _store_integration(
    workspace_id_str: str,
    token: str,
    token_type: str,
    scopes: list[str],
    user_info: dict,
) -> None:
    ws_id = PydanticObjectId(workspace_id_str)
    encrypted = encrypt_token(token)
    github_user_id = str(user_info.get("id", ""))
    github_username = user_info.get("login", "")
    avatar_url = user_info.get("avatar_url", "")

    existing = await GitHubIntegration.find_one(GitHubIntegration.workspace_id == ws_id)
    if existing:
        existing.access_token = encrypted
        existing.token_type = token_type
        existing.scopes = scopes
        existing.github_user_id = github_user_id
        existing.github_username = github_username
        existing.avatar_url = avatar_url
        await existing.save()
    else:
        await GitHubIntegration(
            workspace_id=ws_id,
            github_user_id=github_user_id,
            github_username=github_username,
            avatar_url=avatar_url,
            access_token=encrypted,
            token_type=token_type,
            scopes=scopes,
        ).insert()

    logger.info("GitHub integration stored", workspace_id=workspace_id_str, username=github_username)


def _repo_to_status(repo: GitHubRepo) -> RepoStatusResponse:
    return RepoStatusResponse(
        repo_id=str(repo.id),
        full_name=repo.full_name,
        owner=repo.owner,
        repo_name=repo.repo_name,
        private=repo.private,
        status=repo.status,
        progress_step=repo.progress_step,
        error_message=repo.error_message,
        last_synced_at=repo.last_synced_at,
        files_indexed=repo.files_indexed,
        issues_indexed=repo.issues_indexed,
        prs_indexed=repo.prs_indexed,
        commits_indexed=repo.commits_indexed,
        include_issues=repo.include_issues,
        include_prs=repo.include_prs,
        include_commits=repo.include_commits,
        auto_sync=repo.auto_sync,
        default_branch=repo.default_branch,
    )
