from fastapi import APIRouter
from fastapi.responses import JSONResponse

from config.qdrant import get_async_qdrant_client
from db.session import get_motor_client
from utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get("/health")
async def health():
    """Lightweight liveness probe — just confirms the process is running."""
    return {"status": "ok"}


@router.get("/ready")
async def ready():
    """
    Readiness probe — checks all downstream connections before reporting healthy.
    Returns 200 if all checks pass, 503 if any fail.
    """
    checks: dict[str, str] = {}
    healthy = True

    # MongoDB
    try:
        client = get_motor_client()
        await client.admin.command("ping")
        checks["mongodb"] = "ok"
    except Exception as exc:
        logger.error("MongoDB health check failed", error=str(exc))
        checks["mongodb"] = "error"
        healthy = False

    # Qdrant
    try:
        qdrant = get_async_qdrant_client()
        await qdrant.get_collections()
        checks["qdrant"] = "ok"
    except Exception as exc:
        logger.error("Qdrant health check failed", error=str(exc))
        checks["qdrant"] = "error"
        healthy = False

    status_code = 200 if healthy else 503
    return JSONResponse(
        status_code=status_code,
        content={"status": "ready" if healthy else "degraded", "checks": checks},
    )
