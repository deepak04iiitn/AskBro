"""
BGE embedding model — two modes:

  LOCAL (default, development):
    Loads BAAI/bge-large-en-v1.5 into RAM via HuggingFace.
    Needs ~1.3 GB RAM. Good for local dev.

  API (production / Render free tier):
    Calls HuggingFace Inference API using HF_TOKEN.
    Near-zero local RAM. Rate-limited to ~1000 req/day on free tier.
    Activated automatically when HF_TOKEN is set.
"""

from config.env import settings
from utils.logger import get_logger

logger = get_logger(__name__)


def _build_model():
    if settings.HF_TOKEN:
        # ── Cloud / API mode ──────────────────────────────────────────────────
        logger.info("Embedding mode: HuggingFace Inference API", model=settings.BGE_MODEL_NAME)
        from langchain_huggingface import HuggingFaceEndpointEmbeddings
        return HuggingFaceEndpointEmbeddings(
            model=settings.BGE_MODEL_NAME,
            huggingfacehub_api_token=settings.HF_TOKEN,
        )
    else:
        # ── Local model mode ──────────────────────────────────────────────────
        import torch
        from langchain_huggingface import HuggingFaceEmbeddings
        device = settings.EMBEDDING_DEVICE
        if device == "cuda" and not torch.cuda.is_available():
            device = "cpu"
        logger.info("Embedding mode: local model", model=settings.BGE_MODEL_NAME, device=device)
        return HuggingFaceEmbeddings(
            model_name=settings.BGE_MODEL_NAME,
            model_kwargs={"device": device},
            encode_kwargs={"normalize_embeddings": True},
        )


embedding_model = _build_model()
