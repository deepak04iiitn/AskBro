"""
BGE instruction prefixes.

BGE-large performs significantly better when text is prefixed with a
task-specific instruction. Skipping these measurably degrades recall.
"""

_DOCUMENT_PREFIX = "Represent this document for retrieval: "
_QUERY_PREFIX = "Represent this question for searching relevant passages: "


def enrich_for_indexing(chunk_text: str) -> str:
    """Prepend the document prefix before embedding a chunk during ingestion."""
    return _DOCUMENT_PREFIX + chunk_text


def enrich_for_query(query_text: str) -> str:
    """Prepend the query prefix before embedding a user question at query time."""
    return _QUERY_PREFIX + query_text
