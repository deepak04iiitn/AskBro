from fastapi import HTTPException

from models.testimonial import Testimonial
from schemas.testimonial import TestimonialAdminItem, TestimonialPublic, TestimonialStatusUpdate, TestimonialSubmit


def _initials(name: str) -> str:
    """Return up to 2 uppercase initials from a display name."""
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    if parts:
        return parts[0][0].upper()
    return "?"


def _to_public(t: Testimonial) -> TestimonialPublic:
    return TestimonialPublic(
        id=str(t.id),
        quote=t.quote,
        name=t.name,
        role=t.role,
        initials=t.initials,
        stars=t.stars,
    )


def _to_admin(t: Testimonial) -> TestimonialAdminItem:
    return TestimonialAdminItem(
        id=str(t.id),
        quote=t.quote,
        name=t.name,
        role=t.role,
        initials=t.initials,
        stars=t.stars,
        status=t.status,
        created_at=t.created_at,
    )


async def submit_testimonial(data: TestimonialSubmit) -> dict:
    doc = Testimonial(
        quote=data.quote,
        name=data.name,
        role=data.role,
        initials=_initials(data.name),
        stars=data.stars,
        status="pending",
    )
    await doc.insert()
    return {"message": "Thank you! Your testimonial has been submitted and will appear after review."}


async def list_approved_testimonials() -> list[TestimonialPublic]:
    items = await Testimonial.find(Testimonial.status == "approved").sort(-Testimonial.created_at).to_list()
    return [_to_public(t) for t in items]


async def admin_list_testimonials() -> list[TestimonialAdminItem]:
    items = await Testimonial.find_all().sort(-Testimonial.created_at).to_list()
    return [_to_admin(t) for t in items]


async def admin_update_status(testimonial_id: str, data: TestimonialStatusUpdate) -> TestimonialAdminItem:
    doc = await Testimonial.get(testimonial_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    doc.status = data.status
    await doc.save()
    return _to_admin(doc)


async def admin_delete_testimonial(testimonial_id: str) -> dict:
    doc = await Testimonial.get(testimonial_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    await doc.delete()
    return {"message": "Deleted"}
