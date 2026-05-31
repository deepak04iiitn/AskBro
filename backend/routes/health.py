"""
Health, readiness, and keep-alive endpoints.

──────────────────────────────────────────────────────────────────────────────
KEEP-ALIVE / ANTI-SLEEP PING  (for Render free tier)
──────────────────────────────────────────────────────────────────────────────
Render spins down free-tier services after ~15 minutes of inactivity.
To prevent cold starts, set up an external cron job or uptime monitor to
hit the ping endpoint every 10–14 minutes:

    GET  https://<your-render-app>.onrender.com/ping

Recommended free services for the cron:
  • https://cron-job.org   — free, 1-min resolution
  • https://uptimerobot.com — free, 5-min resolution
  • https://betteruptime.com — free tier available

The /ping route returns instantly (no DB/Qdrant I/O) so it is safe to
hit frequently without stressing downstream services.
──────────────────────────────────────────────────────────────────────────────
"""

import time

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from config.qdrant import get_async_qdrant_client
from db.session import get_motor_client
from utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)
_start_time = time.time()


@router.get("/ping")
async def ping():
    """
    Keep-alive / anti-sleep endpoint for Render free tier.

    Hit this every 10–14 minutes from an external cron/uptime monitor:
        GET  https://<your-render-app>.onrender.com/ping

    Returns instantly — no DB or Qdrant I/O — so it never blocks real traffic.
    """
    return {
        "pong": True,
        "uptime_seconds": round(time.time() - _start_time),
    }


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
