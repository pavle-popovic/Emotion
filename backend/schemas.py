"""Pydantic v2 request/response models."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from models import DanceStyle, SubscriptionStatus, SubscriptionTier


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


class SubscriptionOut(BaseModel):
    tier: SubscriptionTier
    status: SubscriptionStatus
    current_period_end: Optional[datetime] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    preferred_style: Optional[DanceStyle] = None
    is_onboarded: bool
    tier: SubscriptionTier
    subscription: Optional[SubscriptionOut] = None


class OnboardingRequest(BaseModel):
    preferred_style: DanceStyle


# --- catalog ------------------------------------------------------------


class LessonSummary(_ORM):
    id: int
    title: str
    duration_seconds: int
    sort_order: int
    is_preview: bool
    # Per-viewer, so these are filled in by the route rather than the ORM.
    is_locked: bool = False
    is_completed: bool = False
    position_seconds: int = 0


class LessonDetail(LessonSummary):
    body: str
    mux_playback_id: Optional[str] = None
    module_id: int
    module_title: str
    course_slug: str
    course_title: str
    previous_lesson_id: Optional[int] = None
    next_lesson_id: Optional[int] = None
    position: int
    total_in_course: int


class ModuleOut(_ORM):
    id: int
    title: str
    description: str
    sort_order: int
    lessons: List[LessonSummary] = []


class CourseSummary(_ORM):
    id: int
    slug: str
    title: str
    summary: str
    style: DanceStyle
    style_label: str
    cover_image_url: Optional[str] = None
    required_tier: SubscriptionTier
    lesson_count: int
    total_duration_seconds: int
    is_locked: bool = False
    # Only meaningful when the viewer is signed in.
    completed_lessons: int = 0
    progress_percent: int = 0


class CourseDetail(CourseSummary):
    description: str
    modules: List[ModuleOut] = []
    is_enrolled: bool = False
    resume_lesson_id: Optional[int] = None


# --- progress -----------------------------------------------------------


class ProgressUpdate(BaseModel):
    completed: bool = True


class PositionUpdate(BaseModel):
    """Playback heartbeat. Cheap on purpose - it fires every few seconds."""

    position_seconds: int = Field(ge=0)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    preferred_style: Optional[DanceStyle] = None


class ReorderRequest(BaseModel):
    """Full ordered list of ids. Sending the whole order avoids the races you get
    from 'move item X up by one' when two edits overlap."""

    ids: List[int]


class ContinueCard(BaseModel):
    """The "Resume" block on the profile screen."""

    course_slug: str
    course_title: str
    lesson_id: int
    lesson_title: str
    position: int
    total_in_course: int
    progress_percent: int


class DashboardStats(BaseModel):
    lessons_completed: int
    courses_completed: int
    day_streak: int


class Dashboard(BaseModel):
    stats: DashboardStats
    continue_card: Optional[ContinueCard] = None
    courses: List[CourseSummary] = []
