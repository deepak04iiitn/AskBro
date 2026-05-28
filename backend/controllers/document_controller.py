import re
from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import HTTPException, UploadFile, status

from models.chunk import Chunk
from models.document import UploadedDocument
from schemas.document import (
    DocumentDeleteResponse,
    DocumentListItem,
    DocumentStatusResponse,
    DocumentUploadResponse,
)
from schemas.user import CurrentUser
from utils.file_validator import validate_upload
from utils.gridfs_storage import delete_file as gridfs_delete
from utils.gridfs_storage import upload_file as gridfs_upload
from utils.logger import get_logger

logger = get_logger(__name__)

_SAFE_FILENAME = re.compile(r"[^\w.\-]")


def _sanitise_filename(name: str) -> str:
    name = _SAFE_FILENAME.sub("_", name)
    return name[:200]


# ── Upload ────────────────────────────────────────────────────────────────────

async def upload_document(
    file: UploadFile,
    tags_raw: str,
    current_user: CurrentUser,
) -> DocumentUploadResponse:
    # Read bytes once so we can measure size and re-use for GridFS upload
    contents = await file.read()
    await file.seek(0)

    # Validate (raises 400 on failure)
    validate_upload(file, len(contents))

    tags = [t.strip() for t in tags_raw.split(",") if t.strip()] if tags_raw else []
    safe_name = _sanitise_filename(file.filename or "upload")

    # Create a pending DB record first so we have a doc_id for GridFS metadata
    doc = UploadedDocument(
        workspace_id=PydanticObjectId(current_user.workspace_id),
        uploaded_by=PydanticObjectId(current_user.id),
        original_filename=safe_name,
        gridfs_file_id="pending",          # placeholder; updated after GridFS upload
        file_type=safe_name.rsplit(".", 1)[-1].lower(),
        file_size_bytes=len(contents),
        tags=tags,
        status="pending",
    )
    await doc.insert()

    # Upload to GridFS
    gridfs_id = await gridfs_upload(file, current_user.workspace_id, str(doc.id))
    doc.gridfs_file_id = gridfs_id
    doc.updated_at = datetime.now(timezone.utc)
    await doc.save()

    # Enqueue Celery ingestion task
    try:
        from workers.ingestion_worker import ingest_document
        ingest_document.delay(str(doc.id))
        doc.status = "processing"
        doc.updated_at = datetime.now(timezone.utc)
        await doc.save()
    except Exception as exc:
        logger.error("Failed to enqueue ingestion task", doc_id=str(doc.id), error=str(exc))
        # Don't fail the request — the document is stored; worker can be retried manually

    logger.info("Document uploaded", doc_id=str(doc.id), filename=safe_name, workspace=current_user.workspace_id)
    return DocumentUploadResponse(document_id=str(doc.id))


# ── Status polling ────────────────────────────────────────────────────────────

async def get_document_status(
    document_id: str,
    current_user: CurrentUser,
) -> DocumentStatusResponse:
    doc = await _get_workspace_doc(document_id, current_user)
    return DocumentStatusResponse(
        document_id=str(doc.id),
        original_filename=doc.original_filename,
        status=doc.status,
        chunk_count=doc.chunk_count,
        error_message=doc.error_message,
    )


# ── List documents ────────────────────────────────────────────────────────────

async def list_documents(
    current_user: CurrentUser,
    status_filter: str | None = None,
) -> list[DocumentListItem]:
    query = UploadedDocument.find(
        UploadedDocument.workspace_id == PydanticObjectId(current_user.workspace_id)
    )
    if status_filter:
        query = query.find(UploadedDocument.status == status_filter)

    docs = await query.sort(-UploadedDocument.created_at).to_list()
    return [
        DocumentListItem(
            document_id=str(d.id),
            original_filename=d.original_filename,
            file_type=d.file_type,
            file_size_bytes=d.file_size_bytes,
            tags=d.tags,
            status=d.status,
            chunk_count=d.chunk_count,
            created_at=d.created_at,
        )
        for d in docs
    ]


# ── Delete document ───────────────────────────────────────────────────────────

async def delete_document(
    document_id: str,
    current_user: CurrentUser,
) -> DocumentDeleteResponse:
    doc = await _get_workspace_doc(document_id, current_user)

    # Only owner or the uploader can delete
    if current_user.role != "owner" and str(doc.uploaded_by) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this document.",
        )

    # Enqueue cleanup task (handles Qdrant vector deletion + chunk record removal)
    try:
        from workers.cleanup_worker import cleanup_document
        cleanup_document.delay(str(doc.id), doc.gridfs_file_id)
    except Exception as exc:
        logger.error("Failed to enqueue cleanup task", doc_id=str(doc.id), error=str(exc))
        raise HTTPException(status_code=500, detail="Failed to schedule deletion. Please try again.")

    # Delete the document record immediately; chunks/vectors cleaned up async
    await doc.delete()

    logger.info("Document deleted", doc_id=document_id, workspace=current_user.workspace_id)
    return DocumentDeleteResponse(message="Document deleted successfully.")


# ── Shared helper ─────────────────────────────────────────────────────────────

async def _get_workspace_doc(document_id: str, current_user: CurrentUser) -> UploadedDocument:
    """Fetch a document and verify it belongs to the caller's workspace."""
    try:
        oid = PydanticObjectId(document_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid document ID.")

    doc = await UploadedDocument.find_one(
        UploadedDocument.id == oid,
        UploadedDocument.workspace_id == PydanticObjectId(current_user.workspace_id),
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return doc
