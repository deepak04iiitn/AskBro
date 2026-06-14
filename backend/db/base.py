"""
Central registry of all Beanie Document models.
Import DOCUMENT_MODELS wherever init_beanie() is called so every
collection and its indexes are registered in one place.
"""

from models.audit_log import AuditLog
from models.blog_post import BlogPost
from models.chat import Chat
from models.chunk import Chunk
from models.document import UploadedDocument
from models.github_integration import GitHubIntegration
from models.github_repo import GitHubRepo
from models.message import Message
from models.notion_integration import NotionIntegration
from models.testimonial import Testimonial
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
    NotionIntegration,
    GitHubIntegration,
    GitHubRepo,
    BlogPost,
    Testimonial,
]
