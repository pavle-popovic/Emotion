"""Pydantic v2 request/response models."""
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class _ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- auth ---------------------------------------------------------------


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(_ORM):
    id: int
    email: EmailStr
    full_name: str
    role: str


# --- catalog ------------------------------------------------------------


class LessonOut(_ORM):
    id: int
    title: str
    body: str
    video_url: Optional[str] = None
    duration_seconds: int
    sort_order: int


class ModuleOut(_ORM):
    id: int
    title: str
    description: str
    sort_order: int
    lessons: List[LessonOut] = []


class CourseSummary(_ORM):
    id: int
    slug: str
    title: str
    description: str
    is_published: bool


class CourseDetail(CourseSummary):
    modules: List[ModuleOut] = []
