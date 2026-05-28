from motor.motor_asyncio import AsyncIOMotorClient

from config.env import settings

_client: AsyncIOMotorClient | None = None


def get_motor_client() -> AsyncIOMotorClient:
    if _client is None:
        raise RuntimeError("MongoDB client has not been initialised. Call init_db() first.")
    return _client


async def init_db() -> None:
    """
    Create the Motor client and initialise Beanie with all document models.
    Must be called inside the FastAPI lifespan startup hook.
    """
    global _client

    from beanie import init_beanie
    from db.base import DOCUMENT_MODELS

    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    database = _client[settings.MONGODB_DB_NAME]

    await init_beanie(database=database, document_models=DOCUMENT_MODELS)


async def close_db() -> None:
    """Close the Motor connection pool gracefully on shutdown."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
