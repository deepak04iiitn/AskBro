from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class TestimonialSubmit(BaseModel):
    quote: str = Field(..., min_length=20, max_length=500)
    name:  str = Field(..., min_length=2,  max_length=100)
    role:  str = Field(..., min_length=2,  max_length=100)
    stars: int = Field(5, ge=1, le=5)


class TestimonialPublic(BaseModel):
    id:       str
    quote:    str
    name:     str
    role:     str
    initials: str
    stars:    int


class TestimonialAdminItem(TestimonialPublic):
    status:     str
    created_at: datetime


class TestimonialStatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]
