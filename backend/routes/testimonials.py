from fastapi import APIRouter, Depends, Request

from controllers.testimonial_controller import (
    admin_delete_testimonial,
    admin_list_testimonials,
    admin_update_status,
    list_approved_testimonials,
    submit_testimonial,
)
from middleware.admin_auth import get_admin_user
from middleware.rate_limit import API_LIMIT, AUTH_LIMIT, limiter
from schemas.testimonial import (
    TestimonialAdminItem,
    TestimonialPublic,
    TestimonialStatusUpdate,
    TestimonialSubmit,
)

router = APIRouter(prefix="/testimonials", tags=["testimonials"])


# ── Public endpoints ──────────────────────────────────────────────────────────

@router.get("", response_model=list[TestimonialPublic])
@limiter.limit(API_LIMIT)
async def list_testimonials_route(request: Request):
    return await list_approved_testimonials()


@router.post("", status_code=201)
@limiter.limit(AUTH_LIMIT)
async def submit_testimonial_route(request: Request, data: TestimonialSubmit):
    return await submit_testimonial(data)


# ── Admin endpoints (admin JWT required) ──────────────────────────────────────

@router.get("/admin", response_model=list[TestimonialAdminItem])
@limiter.limit(API_LIMIT)
async def admin_list_route(request: Request, _: dict = Depends(get_admin_user)):
    return await admin_list_testimonials()


@router.patch("/admin/{testimonial_id}/status", response_model=TestimonialAdminItem)
@limiter.limit(API_LIMIT)
async def admin_update_status_route(
    request: Request,
    testimonial_id: str,
    data: TestimonialStatusUpdate,
    _: dict = Depends(get_admin_user),
):
    return await admin_update_status(testimonial_id, data)


@router.delete("/admin/{testimonial_id}")
@limiter.limit(API_LIMIT)
async def admin_delete_route(
    request: Request,
    testimonial_id: str,
    _: dict = Depends(get_admin_user),
):
    return await admin_delete_testimonial(testimonial_id)
