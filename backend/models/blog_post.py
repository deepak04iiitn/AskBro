from datetime import datetime
from typing import List, Optional

from beanie import Document, Indexed
from pydantic import Field


class BlogPost(Document):
    slug: Indexed(str, unique=True)
    title: str
    description: str
    content: str                        # markdown body
    date: str                           # ISO date "2026-01-15"
    reading_time: str = "5 min read"
    tags: List[str] = []
    status: str = "draft"               # "draft" | "published"
    author: str = "AskBro Team"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "blog_posts"
