"""
Token counting utility using tiktoken.

Used by the chunking splitter (RecursiveCharacterTextSplitter) as its
length_function so chunk sizes are measured in tokens rather than characters.
"""

import tiktoken

_encoder = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    """Return the number of tokens in text using the cl100k_base encoding."""
    return len(_encoder.encode(text))
