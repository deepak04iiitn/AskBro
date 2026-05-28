"""
GridFS storage using Motor's AsyncIOMotorGridFSBucket.

Files are stored directly in MongoDB — no external storage service needed.
GridFS automatically splits files larger than 255KB into chunks and
reassembles them on download. Works transparently up to the Atlas free
tier storage limit (512MB on M0).

Collections created automatically:
  uploads.files   — file metadata (filename, length, uploadDate, metadata)
  uploads.chunks  — raw binary data in 255KB pieces
"""

from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from config.env import settings
from db.session import get_motor_client

_bucket: AsyncIOMotorGridFSBucket | None = None


def get_gridfs_bucket() -> AsyncIOMotorGridFSBucket:
    """Return the GridFS bucket. Requires init_db() to have run first."""
    global _bucket
    if _bucket is None:
        client = get_motor_client()
        db = client[settings.MONGODB_DB_NAME]
        _bucket = AsyncIOMotorGridFSBucket(
            db,
            bucket_name=settings.GRIDFS_BUCKET_NAME,
        )
    return _bucket
