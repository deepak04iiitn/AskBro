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


def get_gridfs_bucket() -> AsyncIOMotorGridFSBucket:
    """Return a GridFS bucket bound to the current Motor client.

    Not cached — Motor objects are tied to the asyncio event loop that was
    running when they were created. Celery workers spin up a new event loop
    per task via asyncio.run(), so caching across calls would hand back a
    bucket bound to a closed loop.  AsyncIOMotorGridFSBucket is a thin
    wrapper and cheap to construct.
    """
    client = get_motor_client()
    db = client[settings.MONGODB_DB_NAME]
    return AsyncIOMotorGridFSBucket(db, bucket_name=settings.GRIDFS_BUCKET_NAME)
