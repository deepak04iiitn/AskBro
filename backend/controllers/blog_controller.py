from datetime import datetime
from typing import List, Optional

from beanie import PydanticObjectId
from fastapi import HTTPException

from models.blog_post import BlogPost
from schemas.blog import BlogPostCreate, BlogPostPublic, BlogPostSummary, BlogPostUpdate


def _to_public(post: BlogPost) -> BlogPostPublic:
    return BlogPostPublic(
        id=str(post.id),
        slug=post.slug,
        title=post.title,
        description=post.description,
        content=post.content,
        date=post.date,
        reading_time=post.reading_time,
        tags=post.tags,
        status=post.status,
        author=post.author,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


def _to_summary(post: BlogPost) -> BlogPostSummary:
    return BlogPostSummary(
        id=str(post.id),
        slug=post.slug,
        title=post.title,
        description=post.description,
        date=post.date,
        reading_time=post.reading_time,
        tags=post.tags,
        status=post.status,
        author=post.author,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


# ── Public ────────────────────────────────────────────────────────────────────

async def list_published_posts() -> List[BlogPostSummary]:
    posts = await BlogPost.find(BlogPost.status == "published").sort(-BlogPost.date).to_list()
    return [_to_summary(p) for p in posts]


async def get_published_post(slug: str) -> BlogPostPublic:
    post = await BlogPost.find_one(BlogPost.slug == slug, BlogPost.status == "published")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return _to_public(post)


# ── Admin ─────────────────────────────────────────────────────────────────────

async def admin_list_all_posts() -> List[BlogPostSummary]:
    posts = await BlogPost.find_all().sort(-BlogPost.created_at).to_list()
    return [_to_summary(p) for p in posts]


async def admin_get_post(post_id: str) -> BlogPostPublic:
    post = await BlogPost.get(PydanticObjectId(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return _to_public(post)


async def admin_create_post(data: BlogPostCreate) -> BlogPostPublic:
    existing = await BlogPost.find_one(BlogPost.slug == data.slug)
    if existing:
        raise HTTPException(status_code=409, detail="A post with this slug already exists")
    post = BlogPost(**data.model_dump())
    await post.insert()
    return _to_public(post)


async def admin_update_post(post_id: str, data: BlogPostUpdate) -> BlogPostPublic:
    post = await BlogPost.get(PydanticObjectId(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    updates = data.model_dump(exclude_none=True)

    # If slug is changing, check uniqueness
    if "slug" in updates and updates["slug"] != post.slug:
        conflict = await BlogPost.find_one(BlogPost.slug == updates["slug"])
        if conflict:
            raise HTTPException(status_code=409, detail="A post with this slug already exists")

    updates["updated_at"] = datetime.utcnow()
    await post.set(updates)
    return _to_public(post)


async def admin_delete_post(post_id: str) -> dict:
    post = await BlogPost.get(PydanticObjectId(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await post.delete()
    return {"message": "Post deleted"}
