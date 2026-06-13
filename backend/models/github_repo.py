from datetime import datetime, timezone
from typing import Literal

from beanie import Document, PydanticObjectId
from pymongo import IndexModel, ASCENDING
from pydantic import BaseModel, Field


class RepoFileFilters(BaseModel):
    include_extensions: list[str] = Field(default_factory=lambda: [
        ".md", ".txt", ".py", ".ts", ".tsx", ".js", ".jsx",
        ".go", ".rs", ".java", ".rb", ".yml", ".yaml",
        ".toml", ".json", ".sh", ".env.example", ".rst",
        ".html", ".css", ".scss", ".sql", ".graphql",
    ])
    exclude_dirs: list[str] = Field(default_factory=lambda: [
        ".git", "node_modules", "__pycache__", ".venv", "venv",
        "dist", "build", ".next", "out", "vendor", "coverage",
        ".pytest_cache", ".mypy_cache", ".ruff_cache",
    ])
    max_file_size_kb: int = 500
    include_paths: list[str] = Field(default_factory=list)   # glob patterns; empty = all


class GitHubRepo(Document):
    workspace_id: PydanticObjectId
    integration_id: PydanticObjectId
    owner: str
    repo_name: str
    full_name: str                              # "owner/repo"
    private: bool = False
    default_branch: str = "main"
    description: str = ""
    # ingestion toggles
    include_issues: bool = False
    include_prs: bool = False
    include_commits: bool = True               # commit history for blame queries
    auto_sync: bool = False
    file_filters: RepoFileFilters = Field(default_factory=RepoFileFilters)
    # state
    status: Literal["pending", "ingesting", "ready", "failed", "syncing"] = "pending"
    progress_step: str | None = None          # human-readable current phase
    error_message: str | None = None
    last_synced_at: datetime | None = None
    last_commit_sha: str | None = None
    files_indexed: int = 0
    issues_indexed: int = 0
    prs_indexed: int = 0
    commits_indexed: int = 0
    document_ids: list[PydanticObjectId] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "github_repos"
        indexes = [
            IndexModel(
                [("workspace_id", ASCENDING), ("full_name", ASCENDING)],
                unique=True,
            ),
            IndexModel([("workspace_id", ASCENDING), ("status", ASCENDING)]),
        ]
