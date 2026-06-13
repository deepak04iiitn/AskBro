from functools import lru_cache

from qdrant_client import AsyncQdrantClient, QdrantClient
from qdrant_client.models import Distance, HnswConfigDiff, VectorParams

from config.env import settings


@lru_cache
def get_qdrant_client() -> QdrantClient:
    return QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
        timeout=30,
    )


@lru_cache
def get_async_qdrant_client() -> AsyncQdrantClient:
    return AsyncQdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
        timeout=30,
    )


_PAYLOAD_INDEXES = ("workspaceId", "documentId", "repoId", "source", "tags")


async def ensure_collection_exists() -> None:
    """Create the knowledge_base collection if it doesn't already exist."""
    client = get_async_qdrant_client()
    existing = {c.name for c in (await client.get_collections()).collections}

    if settings.QDRANT_COLLECTION_NAME not in existing:
        await client.create_collection(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=1024,
                distance=Distance.COSINE,
            ),
            hnsw_config=HnswConfigDiff(
                m=16,
                ef_construct=100,
            ),
        )

    # Always ensure all payload indexes exist (idempotent — safe to call on startup)
    await ensure_payload_indexes()


async def ensure_payload_indexes() -> None:
    """Create missing payload indexes on an existing collection. Safe to call repeatedly."""
    from qdrant_client.http.exceptions import UnexpectedResponse

    client = get_async_qdrant_client()
    for field in _PAYLOAD_INDEXES:
        try:
            await client.create_payload_index(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                field_name=field,
                field_schema="keyword",
            )
        except UnexpectedResponse as e:
            # 409 Conflict = index already exists — that's fine
            if "409" not in str(e) and "already exists" not in str(e).lower():
                raise
