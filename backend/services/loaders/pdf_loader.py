from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document


def load_pdf(file_path: str) -> list[Document]:
    """
    Load a PDF and return one LangChain Document per page.
    Page number (1-based) is preserved in doc.metadata["page"].
    """
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    # PyPDFLoader sets metadata["page"] as 0-based; convert to 1-based
    for doc in docs:
        doc.metadata["page"] = doc.metadata.get("page", 0) + 1
    return docs
