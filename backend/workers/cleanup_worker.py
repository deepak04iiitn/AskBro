"""
Celery task: delete_document

Removes all artefacts for a document that has been deleted via the API:
  1. GridFS file
  2. Qdrant vectors (filtered by documentId)
  3. Chunk records in MongoDB
  4. UploadedDocument record itself
"""

import asyncio
from datetime import datetime, timezone

from beanie import PydanticObjectId
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from qdrant_client.models import FieldCondition, Filter, MatchValue

from celery_app import celery_app
from config.env import settings
from models.chunk import Chunk
from models.document import UploadedDocument
from utils.logger import get_logger

logger = get_logger(__name__)


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


async def _init_beanie():
    from beanie import init_beanie
    from db.base import DOCUMENT_MODELS

    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    await init_beanie(database=db, document_models=DOCUMENT_MODELS)
    return client


@celery_app.task(
    bind=True,
    name="workers.cleanup_worker.delete_document",
    queue="cleanup",
    max_retries=3,
    default_retry_delay=15,
    acks_late=True,
)
def delete_document(self, document_id: str) -> dict:
    mongo_client = _run(_init_beanie())
    try:
        return _run(_cleanup(document_id))
    finally:
        mongo_client.close()


async def _cleanup(document_id: str) -> dict:
    doc = await UploadedDocument.get(PydanticObjectId(document_id))
    if doc is None:
        logger.warning("Cleanup: document not found — already deleted?", document_id=document_id)
        return {"status": "skipped", "reason": "not_found"}

    logger.info("Cleanup started", document_id=document_id, filename=doc.original_filename)

    # ── 1. Delete file from GridFS ────────────────────────────────────────────
    try:
        from config.storage import get_gridfs_bucket

        bucket = get_gridfs_bucket()
        await bucket.delete(ObjectId(doc.gridfs_file_id))
    except Exception as exc:
        logger.warning("GridFS delete failed (skipping)", document_id=document_id, exc=str(exc))

    # ── 2. Delete vectors from Qdrant (by documentId payload filter) ──────────
    try:
        from services.vectorstore.qdrant_client import get_qdrant_client

        client = get_qdrant_client()
        client.delete(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="documentId",
                        match=MatchValue(value=document_id),
                    )
                ]
            ),
        )
    except Exception as exc:
        logger.warning("Qdrant delete failed (skipping)", document_id=document_id, exc=str(exc))

    # ── 3. Delete Chunk records ───────────────────────────────────────────────
    await Chunk.find(Chunk.document_id == doc.id).delete()

    # ── 4. Delete UploadedDocument record ─────────────────────────────────────
    await doc.delete()

    logger.info("Cleanup completed", document_id=document_id)
    return {"status": "deleted", "document_id": document_id}
