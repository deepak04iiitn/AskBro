"""
BGE-large embedding model singleton.

Loaded once when the module is first imported. Subsequent calls reuse the
same in-memory model — no reload overhead per request or task.
"""

import torch
from langchain_huggingface import HuggingFaceEmbeddings

from config.env import settings

_device = settings.EMBEDDING_DEVICE

# Fall back to CPU if CUDA was requested but is unavailable
if _device == "cuda" and not torch.cuda.is_available():
    _device = "cpu"

embedding_model = HuggingFaceEmbeddings(
    model_name=settings.BGE_MODEL_NAME,
    model_kwargs={"device": _device},
    encode_kwargs={"normalize_embeddings": True},
)
