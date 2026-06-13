"""
Celery task: ingest_github_repo

Full pipeline for indexing a GitHub repository:
  fetch tree → filter files → fetch content → convert → chunk → embed → upsert
  (optionally: commits with diffs, issues + comments, pull requests + reviews)
"""

import sys
from pathlib import Path

_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import asyncio
import traceback
import uuid
from datetime import datetime, timezone

from beanie import PydanticObjectId
from celery import Task

from celery_app import celery_app
from models.chunk import Chunk
from models.github_repo import GitHubRepo
from models.github_integration import GitHubIntegration
from services.chunking.enricher import enrich_for_indexing
from services.chunking.splitter import split_documents
from services.embeddings.batch_processor import embed_batch
from services.github.client import (
    get_commit_detail,
    get_file_content,
    get_issue_comments,
    get_pr_reviews,
    get_latest_commit_sha,
    get_repo_tree,
    list_commits,
    list_issues,
    list_pull_requests,
)
from services.github.converter import (
    commit_to_document,
    files_to_documents,
    issue_to_document,
    pr_to_document,
)
from services.github.tree_walker import filter_tree
from services.vectorstore.upsert import build_point, upsert_chunks
from utils.crypto import decrypt_github_token
from utils.logger import get_logger

logger = get_logger(__name__)

_FILE_CONCURRENCY   = 10   # parallel file fetches
_COMMIT_CONCURRENCY = 20   # parallel commit-detail fetches
_ISSUE_CONCURRENCY  = 20   # parallel issue-comment fetches
_PR_CONCURRENCY     = 20   # parallel PR-review fetches
_COMMIT_LIMIT = 200
_ISSUE_LIMIT  = 300
_PR_LIMIT     = 200


@celery_app.task(
    bind=True,
    name="workers.github_ingestion_worker.ingest_github_repo",
    queue="ingestion",
    max_retries=3,
    default_retry_delay=60,
    acks_late=True,
)
def ingest_github_repo(self: Task, repo_id: str) -> dict:
    async def _task():
        from db.session import init_db, get_motor_client
        client = await init_db()
        mongo_client = get_motor_client()
        try:
            return await _ingest(self, repo_id)
        finally:
            mongo_client.close()

    return asyncio.run(_task())


async def _ingest(task: Task, repo_id: str) -> dict:
    repo = await GitHubRepo.get(PydanticObjectId(repo_id))
    if not repo:
        raise ValueError(f"GitHubRepo not found: {repo_id}")

    integration = await GitHubIntegration.get(repo.integration_id)
    if not integration:
        raise ValueError("GitHub integration record missing.")

    token = decrypt_github_token(integration.access_token)
    owner, repo_name = repo.owner, repo.repo_name
    branch = repo.default_branch
    ws_id = str(repo.workspace_id)

    logger.info("GitHub ingestion started", repo=repo.full_name, workspace=ws_id)

    async def _set(fields: dict) -> None:
        """Direct motor update — bypasses Beanie revision-ID locking."""
        fields["updated_at"] = datetime.now(timezone.utc)
        await GitHubRepo.get_motor_collection().update_one(
            {"_id": repo.id},
            {"$set": fields},
        )
        for k, v in fields.items():
            setattr(repo, k, v)

    await _set({"status": "ingesting", "progress_step": "Getting ready…", "error_message": None})

    async def _progress(step: str) -> None:
        await _set({"progress_step": step})

    try:
        # ── Determine what changed ────────────────────────────────────────────
        await _progress("Connecting to GitHub…")
        current_sha = await get_latest_commit_sha(token, owner, repo_name, branch)
        is_incremental = bool(repo.last_commit_sha and repo.last_commit_sha != current_sha)

        # ── 1. Code files ─────────────────────────────────────────────────────
        await _progress("Reading your code files…")
        files_indexed = await _index_files(
            task, token, owner, repo_name, branch, current_sha,
            repo, ws_id, is_incremental, _progress,
        )

        # ── 2. Commit history (for blame queries) ─────────────────────────────
        commits_indexed = 0
        if repo.include_commits:
            await _progress("Reading commit history…")
            commits_indexed = await _index_commits(
                task, token, owner, repo_name, branch, repo, ws_id, _progress
            )

        # ── 3. Issues ─────────────────────────────────────────────────────────
        issues_indexed = 0
        if repo.include_issues:
            await _progress("Reading issues…")
            issues_indexed = await _index_issues(task, token, owner, repo_name, repo, ws_id, _progress)

        # ── 4. Pull requests ──────────────────────────────────────────────────
        prs_indexed = 0
        if repo.include_prs:
            await _progress("Reading pull requests…")
            prs_indexed = await _index_prs(task, token, owner, repo_name, repo, ws_id, _progress)

        await _progress("Building your knowledge base…")

        # ── Finalise ──────────────────────────────────────────────────────────
        await _set({
            "status": "ready",
            "progress_step": None,
            "last_commit_sha": current_sha,
            "last_synced_at": datetime.now(timezone.utc),
            "files_indexed": files_indexed,
            "commits_indexed": commits_indexed,
            "issues_indexed": issues_indexed,
            "prs_indexed": prs_indexed,
            "error_message": None,
        })

        logger.info(
            "GitHub ingestion completed",
            repo=repo.full_name,
            files=files_indexed,
            commits=commits_indexed,
            issues=issues_indexed,
            prs=prs_indexed,
        )
        return {
            "status": "completed",
            "files": files_indexed,
            "commits": commits_indexed,
            "issues": issues_indexed,
            "prs": prs_indexed,
        }

    except Exception as exc:
        tb = traceback.format_exc()
        logger.error("GitHub ingestion failed", repo=repo.full_name, error=str(exc), tb=tb)
        try:
            await _set({"status": "failed", "error_message": str(exc)[:1000], "progress_step": None})
        except Exception:
            pass
        raise


# ── File indexing ─────────────────────────────────────────────────────────────

async def _index_files(
    task, token, owner, repo_name, branch, current_sha,
    repo: GitHubRepo, ws_id: str, is_incremental: bool, _progress,
) -> int:
    import asyncio

    tree = await get_repo_tree(token, owner, repo_name, current_sha)
    paths = filter_tree(tree, repo.file_filters)

    if not paths:
        return 0

    await _progress(f"Downloading {len(paths)} files…")

    fetched: list[tuple[str, str]] = []
    for i in range(0, len(paths), _FILE_CONCURRENCY):
        batch_paths = paths[i : i + _FILE_CONCURRENCY]
        results = await asyncio.gather(*[
            _safe_fetch_file(token, owner, repo_name, p, current_sha)
            for p in batch_paths
        ])
        for path, content in zip(batch_paths, results):
            if content is not None:
                fetched.append((path, content))

    if not fetched:
        return 0

    await _progress(f"Understanding {len(fetched)} files…")
    langchain_docs = files_to_documents(
        fetched, owner, repo_name, branch, current_sha,
        repo_id=str(repo.id), workspace_id=ws_id,
    )

    await _embed_and_upsert(langchain_docs, repo, ws_id, source_type="file")
    return len(fetched)


async def _safe_fetch_file(token, owner, repo_name, path, ref) -> str | None:
    try:
        return await get_file_content(token, owner, repo_name, path, ref)
    except UnicodeDecodeError:
        return None   # binary file — skip
    except Exception as e:
        logger.warning("Failed to fetch file", path=path, error=str(e))
        return None


# ── Commit indexing ───────────────────────────────────────────────────────────

async def _index_commits(
    task, token, owner, repo_name, branch, repo: GitHubRepo, ws_id: str, _progress,
) -> int:
    import asyncio

    commits = await list_commits(token, owner, repo_name, branch, max_commits=_COMMIT_LIMIT)
    if not commits:
        return 0

    await _progress(f"Analysing {len(commits)} commits…")

    async def _fetch_one(commit):
        sha = commit["sha"]
        try:
            detail = await get_commit_detail(token, owner, repo_name, sha)
            changed_files = detail.get("files", [])
            if not changed_files or len(changed_files) > 30:
                return None
            return commit_to_document(
                commit=commit, changed_files=changed_files,
                owner=owner, repo=repo_name, branch=branch,
                repo_id=str(repo.id), workspace_id=ws_id,
            )
        except Exception as e:
            logger.warning("Failed to fetch commit detail", sha=sha, error=str(e))
            return None

    docs = []
    for i in range(0, len(commits), _COMMIT_CONCURRENCY):
        batch = commits[i : i + _COMMIT_CONCURRENCY]
        results = await asyncio.gather(*[_fetch_one(c) for c in batch])
        docs.extend(r for r in results if r is not None)

    if not docs:
        return 0

    await _progress(f"Learning from {len(docs)} commits…")
    await _embed_and_upsert(docs, repo, ws_id, source_type="commit")
    return len(docs)


# ── Issue indexing ────────────────────────────────────────────────────────────

async def _index_issues(
    task, token, owner, repo_name, repo: GitHubRepo, ws_id: str, _progress,
) -> int:
    import asyncio

    issues = await list_issues(token, owner, repo_name, state="all", max_issues=_ISSUE_LIMIT)
    if not issues:
        return 0

    await _progress(f"Reading {len(issues)} issues…")

    async def _fetch_one(issue):
        try:
            comments = await get_issue_comments(token, owner, repo_name, issue["number"])
            return issue_to_document(
                issue=issue, comments=comments,
                owner=owner, repo=repo_name,
                repo_id=str(repo.id), workspace_id=ws_id,
            )
        except Exception as e:
            logger.warning("Failed to fetch issue", number=issue.get("number"), error=str(e))
            return None

    docs = []
    for i in range(0, len(issues), _ISSUE_CONCURRENCY):
        batch = issues[i : i + _ISSUE_CONCURRENCY]
        results = await asyncio.gather(*[_fetch_one(iss) for iss in batch])
        docs.extend(r for r in results if r is not None)

    if not docs:
        return 0

    await _embed_and_upsert(docs, repo, ws_id, source_type="issue")
    return len(docs)


# ── PR indexing ───────────────────────────────────────────────────────────────

async def _index_prs(
    task, token, owner, repo_name, repo: GitHubRepo, ws_id: str, _progress,
) -> int:
    import asyncio

    prs = await list_pull_requests(token, owner, repo_name, state="all", max_prs=_PR_LIMIT)
    if not prs:
        return 0

    await _progress(f"Reading {len(prs)} pull requests…")

    async def _fetch_one(pr):
        try:
            reviews = await get_pr_reviews(token, owner, repo_name, pr["number"])
            return pr_to_document(
                pr=pr, reviews=reviews,
                owner=owner, repo=repo_name,
                repo_id=str(repo.id), workspace_id=ws_id,
            )
        except Exception as e:
            logger.warning("Failed to fetch PR", number=pr.get("number"), error=str(e))
            return None

    docs = []
    for i in range(0, len(prs), _PR_CONCURRENCY):
        batch = prs[i : i + _PR_CONCURRENCY]
        results = await asyncio.gather(*[_fetch_one(p) for p in batch])
        docs.extend(r for r in results if r is not None)

    if not docs:
        return 0

    await _embed_and_upsert(docs, repo, ws_id, source_type="pull_request")
    return len(docs)


# ── Shared embed + upsert ─────────────────────────────────────────────────────

async def _embed_and_upsert(
    langchain_docs: list,
    repo: GitHubRepo,
    ws_id: str,
    source_type: str,
) -> None:
    """Split, embed, and upsert a list of LangChain Documents."""
    chunks = split_documents(langchain_docs)
    if not chunks:
        return

    enriched = [enrich_for_indexing(c.page_content) for c in chunks]
    vectors = embed_batch(enriched)

    now_iso = datetime.now(timezone.utc).isoformat()
    points = []
    chunk_docs = []

    for idx, (chunk, vector) in enumerate(zip(chunks, vectors)):
        point_id = str(uuid.uuid4())
        meta = chunk.metadata

        payload = {
            "workspaceId": ws_id,
            "repoId": str(repo.id),
            "repoFullName": repo.full_name,
            "source": "github",
            "sourceType": meta.get("sourceType", source_type),
            "fileName": repo.full_name,
            # File-specific
            "filePath": meta.get("filePath", ""),
            "githubUrl": meta.get("githubUrl", ""),
            "branch": meta.get("branch", repo.default_branch),
            "commitSha": meta.get("commitSha", ""),
            # Commit-specific
            "authorName": meta.get("authorName", ""),
            "authorEmail": meta.get("authorEmail", ""),
            "committedAt": meta.get("committedAt", ""),
            "commitMessage": meta.get("commitMessage", ""),
            "prReference": meta.get("prReference", ""),
            # Issue / PR
            "issueNumber": meta.get("issueNumber"),
            "prNumber": meta.get("prNumber"),
            "chunkIndex": idx,
            "chunkText": chunk.page_content[:200],
            "createdAt": now_iso,
        }

        points.append(build_point(vector, payload))
        chunk_docs.append(Chunk(
            document_id=repo.id,        # use repo id as the document reference
            workspace_id=repo.workspace_id,
            qdrant_point_id=point_id,
            chunk_index=idx,
            page_number=None,
            text_preview=chunk.page_content[:200],
        ))

    upsert_chunks(points)
    await Chunk.insert_many(chunk_docs)
