import enum
from datetime import datetime

from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .style import DanceStyle
from .subscription import SubscriptionTier


class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), default="")
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    # Chosen in onboarding step 1. Null means they skipped it.
    preferred_style: Mapped[Optional[DanceStyle]] = mapped_column(Enum(DanceStyle), nullable=True)
    onboarded_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    subscription = relationship(
        "Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("LessonProgress", back_populates="user", cascade="all, delete-orphan")

    @property
    def is_admin(self) -> bool:
        return self.role is UserRole.ADMIN

    @property
    def tier(self) -> SubscriptionTier:
        """The tier this user can actually use right now.

        A lapsed or canceled subscription falls back to FREE rather than keeping
        the tier it used to be, so gating never has to re-check status itself.
        """
        if self.subscription is None:
            return SubscriptionTier.FREE
        return self.subscription.effective_tier
