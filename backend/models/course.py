from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .style import DanceStyle
from .subscription import SubscriptionTier


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(String(500), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    cover_image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    style: Mapped[DanceStyle] = mapped_column(
        Enum(DanceStyle), default=DanceStyle.ALL_STYLES, nullable=False, index=True
    )
    required_tier: Mapped[SubscriptionTier] = mapped_column(
        Enum(SubscriptionTier), default=SubscriptionTier.FREE, nullable=False
    )
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    modules = relationship(
        "Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.sort_order"
    )
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")

    @property
    def lessons_in_order(self) -> list["Lesson"]:
        """Flat lesson sequence across modules - the order a student walks it."""
        return [lesson for module in self.modules for lesson in module.lessons]


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    course = relationship("Course", back_populates="modules")
    lessons = relationship(
        "Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.sort_order"
    )


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, default="")
    mux_playback_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mux_asset_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # Held between creating a direct upload and the asset becoming ready, so the
    # admin UI can poll an in-flight upload after a page reload.
    mux_upload_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mux_status: Mapped[str] = mapped_column(String(32), default="none", nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # A preview lesson is readable even when the course is above the user's tier.
    # This is the hook the marketing site uses to let people taste a paid course.
    is_preview: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    module = relationship("Module", back_populates="lessons")
    progress = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_enrollment_user_course"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_seen_lesson_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True
    )

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    last_seen_lesson = relationship("Lesson", foreign_keys=[last_seen_lesson_id])


class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_progress_user_lesson"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress")
