import uuid

from qdrant_client.models import FieldCondition, Filter, MatchValue, PointStruct

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


def delete_repo_chunks(repo_id: str) -> None:
    """Delete all Qdrant vectors for a given repo. Called before re-indexing to avoid stale chunks."""
    client = get_qdrant_client()
    client.delete(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        points_selector=Filter(must=[
            FieldCondition(key="repoId", match=MatchValue(value=repo_id)),
        ]),
        wait=True,
    )
