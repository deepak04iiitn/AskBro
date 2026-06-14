"""Cleanup task: delete all Qdrant vectors + Chunk records for a removed GitHub repo."""

import sys
from pathlib import Path

_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import asyncio

from celery_app import celery_app
from utils.logger import get_logger

logger = get_logger(__name__)


@celery_app.task(
    bind=True,
    name="workers.cleanup_github_worker.cleanup_github_repo",
    queue="cleanup",
    max_retries=3,
    default_retry_delay=30,
)
def cleanup_github_repo(self, repo_id: str, workspace_id: str) -> dict:
    async def _task():
        from db.session import init_db, get_motor_client
        await init_db()
        client = get_motor_client()
        try:
            return await _cleanup(repo_id, workspace_id)
        finally:
            client.close()

    return asyncio.run(_task())


async def _cleanup(repo_id: str, workspace_id: str) -> dict:
    from beanie import PydanticObjectId
    from qdrant_client.models import FieldCondition, Filter, MatchValue
    from models.chunk import Chunk
    from services.vectorstore.qdrant_client import get_qdrant_client
    from config.env import settings

    # Delete from Qdrant by repoId payload field
    client = get_qdrant_client()
    client.delete(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(key="repoId", match=MatchValue(value=repo_id)),
                FieldCondition(key="workspaceId", match=MatchValue(value=workspace_id)),
            ]
        ),
    )

    # Delete Chunk records from MongoDB
    # Chunks for repos use repo.id as document_id
    repo_oid = PydanticObjectId(repo_id)
    result = await Chunk.find(Chunk.document_id == repo_oid).delete()

    logger.info("GitHub repo cleanup completed", repo_id=repo_id, chunks_deleted=result)
    return {"status": "cleaned", "repo_id": repo_id}
