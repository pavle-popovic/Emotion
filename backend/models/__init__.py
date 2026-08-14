"""SQLAlchemy models and session plumbing.

The engine is built lazily so the app can import cleanly (and `/health` can
answer) even when DATABASE_URL is not yet set — useful on a first Railway boot
before Supabase is wired in.
"""
from .base import Base, get_db, get_engine, get_session_local
from .user import User, UserRole
from .course import Course, Module, Lesson, Enrollment, LessonProgress

__all__ = [
    "Base",
    "get_db",
    "get_engine",
    "get_session_local",
    "User",
    "UserRole",
    "Course",
    "Module",
    "Lesson",
    "Enrollment",
    "LessonProgress",
]
