"""
GridFS helper functions used by upload endpoints and Celery workers.

All functions go through the bucket returned by config/storage.py so the
connection is initialised once and reused.
"""

import io
from bson import ObjectId
from fastapi import UploadFile

from config.storage import get_gridfs_bucket


async def upload_file(
    file: UploadFile,
    workspace_id: str,
    doc_id: str,
) -> str:
    """
    Stream an uploaded file into GridFS.

    Stores workspace_id and doc_id in the GridFS file metadata so files
    can be queried/cleaned up by workspace if needed.

    Returns the GridFS file_id as a plain string (stored in UploadedDocument).
    """
    bucket = get_gridfs_bucket()

    contents = await file.read()

    gridfs_id = await bucket.upload_from_stream(
        filename=file.filename,
        source=io.BytesIO(contents),
        metadata={
            "workspace_id": workspace_id,
            "doc_id": doc_id,
            "content_type": file.content_type,
        },
    )

    return str(gridfs_id)


async def download_file(file_id: str) -> bytes:
    """
    Download a file from GridFS by its file_id string.
    Used by the Celery ingestion worker to fetch the raw file for processing.
    """
    bucket = get_gridfs_bucket()
    buffer = io.BytesIO()
    await bucket.download_to_stream(ObjectId(file_id), buffer)
    return buffer.getvalue()


async def delete_file(file_id: str) -> None:
    """
    Delete a file from GridFS by its file_id string.
    Called during document deletion to free up storage.
    """
    bucket = get_gridfs_bucket()
    await bucket.delete(ObjectId(file_id))
