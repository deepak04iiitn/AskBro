from langchain_community.document_loaders import TextLoader
from langchain_core.documents import Document


def load_text(file_path: str) -> list[Document]:
    """
    Load a plain text or Markdown file.
    Tries UTF-8 first; falls back to latin-1 if the file has non-UTF-8 bytes.
    """
    for encoding in ("utf-8", "latin-1"):
        try:
            loader = TextLoader(file_path, encoding=encoding)
            docs = loader.load()
            for doc in docs:
                doc.metadata.setdefault("page", None)
            return docs
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Could not decode file: {file_path}")
