"""
Celery task: process_document

Full pipeline for a single uploaded document:
  download → load → chunk → enrich → embed → upsert to Qdrant → save Chunks → mark done
"""

import asyncio
import tempfile
import traceback
from datetime import datetime, timezone
from pathlib import Path

from beanie import PydanticObjectId
from bson import ObjectId
from celery import Task
from motor.motor_asyncio import AsyncIOMotorClient

from celery_app import celery_app
from config.env import settings
from models.chunk import Chunk
from models.document import UploadedDocument
from services.chunking.enricher import enrich_for_indexing
from services.chunking.splitter import split_documents
from services.embeddings.batch_processor import embed_batch
from services.loaders.docx_loader import load_docx
from services.loaders.pdf_loader import load_pdf
from services.loaders.text_loader import load_text
from services.vectorstore.upsert import build_point, upsert_chunks
from utils.logger import get_logger

logger = get_logger(__name__)

_LOADER_MAP = {
    "pdf": load_pdf,
    "docx": load_docx,
    "md": load_text,
    "txt": load_text,
}


# ── helpers ──────────────────────────────────────────────────────────────────

def _run(coro):
    """Run an async coroutine from sync Celery context."""
    return asyncio.get_event_loop().run_until_complete(coro)


async def _init_beanie():
    """Initialise Beanie inside the Celery worker process."""
    from beanie import init_beanie
    from db.base import DOCUMENT_MODELS

    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    await init_beanie(database=db, document_models=DOCUMENT_MODELS)
    return client


async def _download_gridfs(gridfs_file_id: str) -> bytes:
    from config.storage import get_gridfs_bucket

    bucket = get_gridfs_bucket()
    stream = await bucket.open_download_stream(ObjectId(gridfs_file_id))
    return await stream.read()


# ── main task ─────────────────────────────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="workers.ingestion_worker.process_document",
    queue="ingestion",
    max_retries=5,
    default_retry_delay=30,
    acks_late=True,
)
def process_document(self: Task, document_id: str) -> dict:
    """
    Ingest a single uploaded document end-to-end.

    Args:
        document_id: str(ObjectId) of the UploadedDocument record.

    Returns:
        {"status": "completed", "chunk_count": N}
    """
    mongo_client = _run(_init_beanie())
    tmp_path: Path | None = None

    try:
        result = _run(_process(self, document_id))
        return result
    finally:
        mongo_client.close()
        if tmp_path and tmp_path.exists():
            tmp_path.unlink(missing_ok=True)


async def _process(task: Task, document_id: str) -> dict:
    # ── 1. Fetch document record ──────────────────────────────────────────────
    doc = await UploadedDocument.get(PydanticObjectId(document_id))
    if doc is None:
        raise ValueError(f"Document not found: {document_id}")

    logger.info("Ingestion started", document_id=document_id, filename=doc.original_filename)

    # ── 2. Mark processing ────────────────────────────────────────────────────
    doc.status = "processing"
    doc.updated_at = datetime.now(timezone.utc)
    await doc.save()

    tmp_path: Path | None = None

    try:
        # ── 3. Download from GridFS ───────────────────────────────────────────
        try:
            file_bytes = await _download_gridfs(doc.gridfs_file_id)
        except Exception as exc:
            logger.warning("GridFS download failed, retrying", document_id=document_id, exc=str(exc))
            raise task.retry(exc=exc, countdown=2 ** task.request.retries * 5)

        # ── 4. Write to temp file ─────────────────────────────────────────────
        suffix = f".{doc.file_type}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file_bytes)
            tmp_path = Path(tmp.name)

        # ── 5 & 6. Load with appropriate loader ───────────────────────────────
        loader_fn = _LOADER_MAP.get(doc.file_type)
        if loader_fn is None:
            raise ValueError(f"Unsupported file type: {doc.file_type}")

        try:
            langchain_docs = loader_fn(str(tmp_path))
        except Exception as exc:
            # corrupted file — no retry
            raise RuntimeError(f"Loader failed for {doc.file_type}: {exc}") from exc

        # ── 7. Split into chunks ──────────────────────────────────────────────
        chunks = split_documents(langchain_docs)
        if not chunks:
            raise RuntimeError("Splitter produced 0 chunks — file may be empty")

        # ── 8. Enrich chunk texts for BGE ─────────────────────────────────────
        enriched_texts = [enrich_for_indexing(c.page_content) for c in chunks]

        # ── 9. Batch embed ────────────────────────────────────────────────────
        try:
            vectors = embed_batch(enriched_texts)
        except Exception as exc:
            logger.warning("Embedding failed, retrying", document_id=document_id, exc=str(exc))
            raise task.retry(exc=exc, countdown=30)

        # ── 10 & 11. Build points and upsert to Qdrant ────────────────────────
        qdrant_points = []
        for idx, (chunk, vector) in enumerate(zip(chunks, vectors)):
            page = chunk.metadata.get("page")
            payload = {
                "documentId": document_id,
                "fileName": doc.original_filename,
                "uploadedBy": str(doc.uploaded_by),
                "workspaceId": str(doc.workspace_id),
                "tags": doc.tags,
                "pageNumber": page,
                "chunkIndex": idx,
            }
            qdrant_points.append(build_point(vector, payload))

        try:
            upsert_chunks(qdrant_points)
        except Exception as exc:
            logger.warning("Qdrant upsert failed, retrying", document_id=document_id, exc=str(exc))
            raise task.retry(exc=exc, countdown=10, max_retries=3)

        # ── 12. Insert Chunk documents to MongoDB ─────────────────────────────
        chunk_docs = [
            Chunk(
                document_id=doc.id,
                workspace_id=doc.workspace_id,
                qdrant_point_id=point.id,
                chunk_index=idx,
                page_number=chunks[idx].metadata.get("page"),
                text_preview=chunks[idx].page_content[:200],
            )
            for idx, point in enumerate(qdrant_points)
        ]
        await Chunk.insert_many(chunk_docs)

        # ── 13. Mark document completed ───────────────────────────────────────
        doc.status = "completed"
        doc.chunk_count = len(chunk_docs)
        doc.error_message = None
        doc.updated_at = datetime.now(timezone.utc)
        await doc.save()

        logger.info(
            "Ingestion completed",
            document_id=document_id,
            chunk_count=len(chunk_docs),
        )
        return {"status": "completed", "chunk_count": len(chunk_docs)}

    except task.MaxRetriesExceededError:
        await _mark_failed(doc, "Max retries exceeded")
        raise
    except Exception as exc:
        tb = traceback.format_exc()
        logger.error("Ingestion failed", document_id=document_id, error=str(exc), traceback=tb)
        await _mark_failed(doc, str(exc))
        raise

    finally:
        # ── 14. Clean up temp file ────────────────────────────────────────────
        if tmp_path and tmp_path.exists():
            tmp_path.unlink(missing_ok=True)


async def _mark_failed(doc: UploadedDocument, reason: str) -> None:
    doc.status = "failed"
    doc.error_message = reason[:1000]
    doc.updated_at = datetime.now(timezone.utc)
    await doc.save()
