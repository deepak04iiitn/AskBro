from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from config.env import settings
from middleware.rate_limit import limiter
from config.qdrant import ensure_collection_exists
from db.session import close_db, init_db
from routes import admin as admin_router
from routes import chat, documents, health, integrations, workspaces
from utils.logger import get_logger, setup_logging

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────────
    setup_logging()
    logger.info("Starting AskBro API", env=settings.APP_ENV)

    await init_db()
    logger.info("MongoDB connected", db=settings.MONGODB_DB_NAME)

    # GridFS bucket is lazy-initialised on first use via config/storage.py
    logger.info("File storage: MongoDB GridFS", bucket=settings.GRIDFS_BUCKET_NAME)

    await ensure_collection_exists()
    logger.info("Qdrant collection ready", collection=settings.QDRANT_COLLECTION_NAME)

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    await close_db()
    logger.info("MongoDB connection closed")


app = FastAPI(
    title="AskBro API",
    description="RAG-powered internal knowledge assistant",
    version="0.1.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# ── Rate limiting ─────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router, tags=["health"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(workspaces.router, prefix="/api/v1", tags=["workspaces"])
app.include_router(admin_router.router, prefix="/api/v1", tags=["admin"])
app.include_router(integrations.router, prefix="/api/v1", tags=["integrations"])
