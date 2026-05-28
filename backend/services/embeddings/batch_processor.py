from config.env import settings
from services.embeddings.bge_model import embedding_model


def embed_batch(texts: list[str]) -> list[list[float]]:
    """
    Embed a list of texts in batches of EMBEDDING_BATCH_SIZE (default 32).
    Returns a list of 1024-dimensional float vectors, one per input text.
    """
    results: list[list[float]] = []
    batch_size = settings.EMBEDDING_BATCH_SIZE

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        vectors = embedding_model.embed_documents(batch)
        results.extend(vectors)

    return results
