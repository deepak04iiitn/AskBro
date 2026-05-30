"""
Central registry of all Beanie Document models.
Import DOCUMENT_MODELS wherever init_beanie() is called so every
collection and its indexes are registered in one place.
"""

from models.audit_log import AuditLog
from models.chat import Chat
from models.chunk import Chunk
from models.document import UploadedDocument
from models.message import Message
from models.user import User
from models.workspace import Workspace

DOCUMENT_MODELS = [
    Workspace,
    User,
    UploadedDocument,
    Chunk,
    AuditLog,
    Chat,
    Message,
]
