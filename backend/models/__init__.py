"""SQLAlchemy models and session plumbing.

The engine is built lazily so the app can import cleanly (and `/health` can
answer) even when DATABASE_URL is not yet set - useful on a first Railway boot
before Supabase is wired in.
"""
from .base import Base, get_db, get_engine, get_session_local
from .course import Course, Enrollment, Lesson, LessonProgress, Module
from .style import STYLE_LABELS, DanceStyle, label_for
from .subscription import TIER_RANK, Subscription, SubscriptionStatus, SubscriptionTier
from .user import User, UserRole

__all__ = [
    "Base",
    "get_db",
    "get_engine",
    "get_session_local",
    "User",
    "UserRole",
    "DanceStyle",
    "STYLE_LABELS",
    "label_for",
    "Subscription",
    "SubscriptionTier",
    "SubscriptionStatus",
    "TIER_RANK",
    "Course",
    "Module",
    "Lesson",
    "Enrollment",
    "LessonProgress",
]
