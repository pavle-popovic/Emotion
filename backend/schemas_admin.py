"""Admin-only request/response models.

Kept separate from schemas.py because these expose fields (unpublished state, Mux
asset ids) that must never leak into a student-facing response.
"""
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from models import DanceStyle, SubscriptionTier


class _ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class AdminLesson(_ORM):
    id: int
    module_id: int
    title: str
    body: str
    duration_seconds: int
    is_preview: bool
    sort_order: int
    mux_playback_id: Optional[str] = None
    mux_asset_id: Optional[str] = None
    mux_upload_id: Optional[str] = None
    mux_status: str


class AdminModule(_ORM):
    id: int
    course_id: int
    title: str
    description: str
    sort_order: int
    lessons: List[AdminLesson] = []


class AdminCourse(_ORM):
    id: int
    slug: str
    title: str
    summary: str
    description: str
    style: DanceStyle
    required_tier: SubscriptionTier
    is_published: bool
    sort_order: int
    cover_image_url: Optional[str] = None
    lesson_count: int = 0


class AdminCourseDetail(AdminCourse):
    modules: List[AdminModule] = []


# --- writes -------------------------------------------------------------


class CourseCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=1, max_length=255)
    summary: str = ""
    description: str = ""
    style: DanceStyle = DanceStyle.ALL_STYLES
    required_tier: SubscriptionTier = SubscriptionTier.MEMBER
    is_published: bool = False
    sort_order: int = 0


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    style: Optional[DanceStyle] = None
    required_tier: Optional[SubscriptionTier] = None
    is_published: Optional[bool] = None
    sort_order: Optional[int] = None
    cover_image_url: Optional[str] = None


class ModuleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    sort_order: Optional[int] = None


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None


class LessonCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    body: str = ""
    is_preview: bool = False
    duration_seconds: int = 0
    sort_order: Optional[int] = None


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    is_preview: Optional[bool] = None
    duration_seconds: Optional[int] = None
    sort_order: Optional[int] = None
    mux_playback_id: Optional[str] = None


class DirectUpload(BaseModel):
    """What the browser needs to PUT the file straight to Mux."""

    upload_id: str
    upload_url: str
