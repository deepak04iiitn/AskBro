"""GitHub REST API v3 client — httpx-based, no SDK."""

import base64
from typing import Any

import httpx

from utils.logger import get_logger

logger = get_logger(__name__)

_BASE = "https://api.github.com"
_TIMEOUT = 20


def _headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


async def verify_token(token: str) -> dict:
    """Call /user — returns user info or raises on invalid token."""
    async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
        r = await c.get(f"{_BASE}/user", headers=_headers(token))
        r.raise_for_status()
        return r.json()


async def list_repos(token: str) -> list[dict]:
    """List all repos the token can access (personal + org), paginated."""
    repos: list[dict] = []
    page = 1
    async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
        while True:
            r = await c.get(
                f"{_BASE}/user/repos",
                headers=_headers(token),
                params={"per_page": 100, "page": page, "sort": "updated", "affiliation": "owner,collaborator,organization_member"},
            )
            r.raise_for_status()
            batch = r.json()
            if not batch:
                break
            repos.extend(batch)
            if len(batch) < 100:
                break
            page += 1
    return repos


async def get_repo(token: str, owner: str, repo: str) -> dict:
    async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
        r = await c.get(f"{_BASE}/repos/{owner}/{repo}", headers=_headers(token))
        r.raise_for_status()
        return r.json()


async def list_branches(token: str, owner: str, repo: str) -> list[str]:
    """Return branch names for a repo (up to 100)."""
    async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
        r = await c.get(
            f"{_BASE}/repos/{owner}/{repo}/branches",
            headers=_headers(token),
            params={"per_page": 100},
        )
        r.raise_for_status()
        return [b["name"] for b in r.json()]


async def get_latest_commit_sha(token: str, owner: str, repo: str, branch: str) -> str:
    async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
        r = await c.get(
            f"{_BASE}/repos/{owner}/{repo}/commits/{branch}",
            headers=_headers(token),
        )
        r.raise_for_status()
        return r.json()["sha"]


async def get_repo_tree(token: str, owner: str, repo: str, sha: str = "HEAD") -> list[dict]:
    """Full recursive file tree. Each item: {path, type, sha, size}."""
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(
            f"{_BASE}/repos/{owner}/{repo}/git/trees/{sha}",
            headers=_headers(token),
            params={"recursive": "1"},
        )
        r.raise_for_status()
        data = r.json()
        if data.get("truncated"):
            logger.warning("GitHub tree truncated — repo is very large", owner=owner, repo=repo)
        return data.get("tree", [])


async def get_file_content(token: str, owner: str, repo: str, path: str, ref: str = "HEAD") -> str:
    """
    Fetch a file's UTF-8 content. Falls back to raw URL for files > 1 MB.
    Raises UnicodeDecodeError for binary files (caller should skip them).
    """
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(
            f"{_BASE}/repos/{owner}/{repo}/contents/{path}",
            headers=_headers(token),
            params={"ref": ref},
        )
        if r.status_code == 403 and "too large" in r.text.lower():
            # Fall back to raw content URL
            raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}"
            rr = await c.get(raw_url, headers=_headers(token), timeout=30)
            rr.raise_for_status()
            return rr.text

        r.raise_for_status()
        data = r.json()
        if data.get("encoding") == "base64":
            raw = base64.b64decode(data["content"])
            return raw.decode("utf-8")
        return data.get("content", "")


async def get_changed_files(
    token: str, owner: str, repo: str, base_sha: str, head_sha: str
) -> list[dict]:
    """Compare two commits — returns list of changed file dicts with status and filename."""
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(
            f"{_BASE}/repos/{owner}/{repo}/compare/{base_sha}...{head_sha}",
            headers=_headers(token),
        )
        r.raise_for_status()
        return r.json().get("files", [])


async def list_commits(
    token: str, owner: str, repo: str, branch: str, max_commits: int = 200
) -> list[dict]:
    """Fetch recent commits with author info and stats."""
    commits: list[dict] = []
    page = 1
    per_page = min(100, max_commits)
    async with httpx.AsyncClient(timeout=30) as c:
        while len(commits) < max_commits:
            r = await c.get(
                f"{_BASE}/repos/{owner}/{repo}/commits",
                headers=_headers(token),
                params={"sha": branch, "per_page": per_page, "page": page},
            )
            r.raise_for_status()
            batch = r.json()
            if not batch:
                break
            commits.extend(batch)
            if len(batch) < per_page:
                break
            page += 1
    return commits[:max_commits]


async def get_commit_detail(token: str, owner: str, repo: str, sha: str) -> dict:
    """Fetch a single commit with its full diff (files changed, patches)."""
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(
            f"{_BASE}/repos/{owner}/{repo}/commits/{sha}",
            headers=_headers(token),
        )
        r.raise_for_status()
        return r.json()


async def list_issues(
    token: str, owner: str, repo: str, state: str = "all", max_issues: int = 300
) -> list[dict]:
    """Fetch issues (excluding PRs) paginated."""
    issues: list[dict] = []
    page = 1
    async with httpx.AsyncClient(timeout=30) as c:
        while len(issues) < max_issues:
            r = await c.get(
                f"{_BASE}/repos/{owner}/{repo}/issues",
                headers=_headers(token),
                params={"state": state, "per_page": 100, "page": page, "pulls": "false"},
            )
            r.raise_for_status()
            batch = r.json()
            if not batch:
                break
            # GitHub issues endpoint returns PRs too — filter them out
            issues.extend([i for i in batch if "pull_request" not in i])
            if len(batch) < 100:
                break
            page += 1
    return issues[:max_issues]


async def get_issue_comments(token: str, owner: str, repo: str, issue_number: int) -> list[dict]:
    async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
        r = await c.get(
            f"{_BASE}/repos/{owner}/{repo}/issues/{issue_number}/comments",
            headers=_headers(token),
            params={"per_page": 50},
        )
        r.raise_for_status()
        return r.json()


async def list_pull_requests(
    token: str, owner: str, repo: str, state: str = "all", max_prs: int = 200
) -> list[dict]:
    prs: list[dict] = []
    page = 1
    async with httpx.AsyncClient(timeout=30) as c:
        while len(prs) < max_prs:
            r = await c.get(
                f"{_BASE}/repos/{owner}/{repo}/pulls",
                headers=_headers(token),
                params={"state": state, "per_page": 100, "page": page, "sort": "updated"},
            )
            r.raise_for_status()
            batch = r.json()
            if not batch:
                break
            prs.extend(batch)
            if len(batch) < 100:
                break
            page += 1
    return prs[:max_prs]


async def get_pr_reviews(token: str, owner: str, repo: str, pr_number: int) -> list[dict]:
    async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
        r = await c.get(
            f"{_BASE}/repos/{owner}/{repo}/pulls/{pr_number}/reviews",
            headers=_headers(token),
            params={"per_page": 50},
        )
        r.raise_for_status()
        return r.json()


def build_oauth_url(client_id: str, state: str, redirect_uri: str) -> str:
    from urllib.parse import urlencode
    params = urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": "repo read:user read:org",
        "state": state,
    })
    return f"https://github.com/login/oauth/authorize?{params}"


async def exchange_oauth_code(client_id: str, client_secret: str, code: str) -> dict:
    async with httpx.AsyncClient(timeout=_TIMEOUT) as c:
        r = await c.post(
            "https://github.com/login/oauth/access_token",
            json={"client_id": client_id, "client_secret": client_secret, "code": code},
            headers={"Accept": "application/json"},
        )
        r.raise_for_status()
        return r.json()
