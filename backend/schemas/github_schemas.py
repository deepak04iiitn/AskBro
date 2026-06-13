from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from models.github_repo import RepoFileFilters


# ── Auth ─────────────────────────────────────────────────────────────────────

class GitHubPATConnectRequest(BaseModel):
    token: str


class GitHubStatusResponse(BaseModel):
    connected: bool
    github_username: str | None = None
    avatar_url: str | None = None
    token_type: str | None = None
    connected_at: datetime | None = None


class GitHubOAuthStartResponse(BaseModel):
    redirect_url: str


# ── Repos ─────────────────────────────────────────────────────────────────────

class RepoListItem(BaseModel):
    full_name: str
    owner: str
    repo_name: str
    private: bool
    description: str
    default_branch: str
    already_imported: bool = False


class RepoImportRequest(BaseModel):
    owner: str
    repo_name: str
    branch: str = "main"
    include_issues: bool = False
    include_prs: bool = False
    include_commits: bool = True
    auto_sync: bool = False
    filters: RepoFileFilters = RepoFileFilters()


class RepoSyncRequest(BaseModel):
    force_full: bool = False             # if True, re-index everything from scratch


class RepoStatusResponse(BaseModel):
    repo_id: str
    full_name: str
    owner: str
    repo_name: str
    private: bool
    status: Literal["pending", "ingesting", "ready", "failed", "syncing"]
    progress_step: str | None = None
    error_message: str | None = None
    last_synced_at: datetime | None = None
    files_indexed: int
    issues_indexed: int
    prs_indexed: int
    commits_indexed: int
    include_issues: bool
    include_prs: bool
    include_commits: bool
    auto_sync: bool
    default_branch: str


class RepoImportResponse(BaseModel):
    repo_id: str
    full_name: str
    message: str
