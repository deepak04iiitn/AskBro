from langchain_community.document_loaders import Docx2txtLoader
from langchain_core.documents import Document


def load_docx(file_path: str) -> list[Document]:
    """
    Load a DOCX file. Returns a single Document — DOCX has no native page metadata.
    """
    loader = Docx2txtLoader(file_path)
    docs = loader.load()
    for doc in docs:
        doc.metadata.setdefault("page", None)
    return docs
