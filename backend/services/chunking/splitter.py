from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from utils.token_counter import count_tokens

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
    length_function=count_tokens,
    separators=["\n\n", "\n", ".", " ", ""],
)


def split_documents(docs: list[Document]) -> list[Document]:
    """
    Split a list of LangChain Documents into 800-token chunks with 150-token overlap.
    Page metadata from the source document is preserved on every chunk.
    """
    return _splitter.split_documents(docs)
