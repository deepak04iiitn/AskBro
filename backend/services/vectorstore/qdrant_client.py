"""
Re-exports the shared Qdrant client singletons from config/qdrant.py
so service-layer code can import from a consistent path.
"""

from config.qdrant import get_async_qdrant_client, get_qdrant_client  # noqa: F401
