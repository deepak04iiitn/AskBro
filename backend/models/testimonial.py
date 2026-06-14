from datetime import datetime, timezone
from typing import Literal

from beanie import Document
from pydantic import Field


class Testimonial(Document):
    quote: str
    name: str
    role: str
    initials: str                                    # auto-computed from name on submission
    stars: int = 5
    status: Literal["pending", "approved", "rejected"] = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "testimonials"
