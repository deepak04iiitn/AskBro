from fastapi import APIRouter, Depends, Request

from controllers.blog_controller import (
    admin_create_post,
    admin_delete_post,
    admin_get_post,
    admin_list_all_posts,
    admin_update_post,
    get_published_post,
    list_published_posts,
)
from middleware.admin_auth import get_admin_user
from middleware.rate_limit import API_LIMIT, limiter
from schemas.blog import BlogPostCreate, BlogPostPublic, BlogPostSummary, BlogPostUpdate

router = APIRouter(prefix="/blog", tags=["blog"])


# ── Public endpoints (no auth) ────────────────────────────────────────────────

@router.get("/posts", response_model=list[BlogPostSummary])
@limiter.limit(API_LIMIT)
async def list_posts_route(request: Request):
    return await list_published_posts()


@router.get("/posts/{slug}", response_model=BlogPostPublic)
@limiter.limit(API_LIMIT)
async def get_post_route(request: Request, slug: str):
    return await get_published_post(slug)


# ── Admin endpoints (admin JWT required) ──────────────────────────────────────

@router.get("/admin/posts", response_model=list[BlogPostSummary])
@limiter.limit(API_LIMIT)
async def admin_list_posts_route(request: Request, _: dict = Depends(get_admin_user)):
    return await admin_list_all_posts()


@router.get("/admin/posts/{post_id}", response_model=BlogPostPublic)
@limiter.limit(API_LIMIT)
async def admin_get_post_route(request: Request, post_id: str, _: dict = Depends(get_admin_user)):
    return await admin_get_post(post_id)


@router.post("/admin/posts", response_model=BlogPostPublic, status_code=201)
@limiter.limit(API_LIMIT)
async def admin_create_post_route(request: Request, data: BlogPostCreate, _: dict = Depends(get_admin_user)):
    return await admin_create_post(data)


@router.put("/admin/posts/{post_id}", response_model=BlogPostPublic)
@limiter.limit(API_LIMIT)
async def admin_update_post_route(request: Request, post_id: str, data: BlogPostUpdate, _: dict = Depends(get_admin_user)):
    return await admin_update_post(post_id, data)


@router.delete("/admin/posts/{post_id}")
@limiter.limit(API_LIMIT)
async def admin_delete_post_route(request: Request, post_id: str, _: dict = Depends(get_admin_user)):
    return await admin_delete_post(post_id)
