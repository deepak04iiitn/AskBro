import uuid

from qdrant_client.models import PointStruct

from config.env import settings
from services.vectorstore.qdrant_client import get_qdrant_client


def build_point(
    vector: list[float],
    payload: dict,
) -> PointStruct:
    """Create a Qdrant PointStruct with a fresh UUID."""
    return PointStruct(
        id=str(uuid.uuid4()),
        vector=vector,
        payload=payload,
    )


def upsert_chunks(points: list[PointStruct]) -> None:
    """
    Batch upsert vectors into the knowledge_base collection.
    Uses the synchronous client — called from Celery workers (not async context).
    Qdrant client handles batching internally; we pass all points at once.
    """
    client = get_qdrant_client()
    client.upsert(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        points=points,
        wait=True,  # block until the upsert is confirmed
    )
