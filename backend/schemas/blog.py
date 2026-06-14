from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class BlogPostPublic(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    content: str
    date: str
    reading_time: str
    tags: List[str]
    status: str
    author: str
    created_at: datetime
    updated_at: datetime


class BlogPostSummary(BaseModel):
    """Lightweight response for list views (no content field)."""
    id: str
    slug: str
    title: str
    description: str
    date: str
    reading_time: str
    tags: List[str]
    status: str
    author: str
    created_at: datetime
    updated_at: datetime


class BlogPostCreate(BaseModel):
    slug: str
    title: str
    description: str
    content: str
    date: str
    reading_time: str = "5 min read"
    tags: List[str] = []
    status: str = "draft"
    author: str = "AskBro Team"


class BlogPostUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    date: Optional[str] = None
    reading_time: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    author: Optional[str] = None
