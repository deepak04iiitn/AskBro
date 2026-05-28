from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────────────
    APP_ENV: Literal["development", "staging", "production"] = "development"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── MongoDB ───────────────────────────────────────────────────────────────
    MONGODB_URI: str = Field(
        ...,
        description="Full MongoDB connection string",
        examples=["mongodb://askbro:askbro@localhost:27017/askbro?authSource=admin"],
    )
    MONGODB_DB_NAME: str = "askbro"
    # GridFS bucket name — files are stored in {GRIDFS_BUCKET}.files / .chunks collections
    GRIDFS_BUCKET_NAME: str = "uploads"

    # ── Qdrant ────────────────────────────────────────────────────────────────
    QDRANT_URL: str = Field(..., description="Qdrant HTTP endpoint, e.g. http://localhost:6333")
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION_NAME: str = "knowledge_base"

    # ── Embeddings ────────────────────────────────────────────────────────────
    BGE_MODEL_NAME: str = "BAAI/bge-large-en-v1.5"
    BGE_RERANKER_MODEL: str = "BAAI/bge-reranker-large"
    EMBEDDING_BATCH_SIZE: int = 32
    EMBEDDING_DEVICE: Literal["cpu", "cuda", "mps"] = "cpu"

    # ── LLM (Qwen3-32B via vLLM) ─────────────────────────────────────────────
    LLM_BASE_URL: str = Field(..., description="OpenAI-compatible vLLM base URL")
    LLM_MODEL_NAME: str = "Qwen/Qwen3-32B"
    LLM_API_KEY: str = "EMPTY"
    LLM_TIMEOUT_SECONDS: int = 30
    LLM_MAX_TOKENS: int = 8192
    LLM_TEMPERATURE: float = 0.1

    # ── JWT ───────────────────────────────────────────────────────────────────
    SECRET_KEY: str = Field(..., min_length=32, description="Long random string for JWT signing")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Celery ────────────────────────────────────────────────────────────────
    # kombu 5.3+ supports mongodb+srv:// — append the target db name to the path
    CELERY_BROKER_URL: str = "mongodb://localhost:27017/celery_broker"
    CELERY_RESULT_BACKEND: str = "mongodb://localhost:27017/celery_results"

    # ── Rate limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 30

    # ── File upload ───────────────────────────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: list[str] = ["pdf", "docx", "md", "txt"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v

    @property
    def MAX_UPLOAD_SIZE_BYTES(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
