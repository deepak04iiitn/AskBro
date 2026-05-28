from qdrant_client.models import Filter, ScoredPoint

from config.env import settings
from services.vectorstore.qdrant_client import get_qdrant_client


def semantic_search(
    query_vector: list[float],
    qdrant_filter: Filter,
    top_k: int = 20,
) -> list[ScoredPoint]:
    """
    Run a filtered similarity search against the knowledge_base collection.
    Always requires a qdrant_filter (workspace scoping) — never search without one.
    Returns up to top_k scored points.
    """
    client = get_qdrant_client()
    return client.search(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        query_vector=query_vector,
        query_filter=qdrant_filter,
        limit=top_k,
        with_payload=True,
    )
