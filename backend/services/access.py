"""Tier gating.

Every "can this person see this?" decision goes through here. Route handlers must
never compare tiers themselves, or the rules drift apart between the catalog, the
course page and the lesson endpoint - which is exactly how paid content leaks.
"""
from typing import Optional

from fastapi import HTTPException, status

from models import TIER_RANK, Course, Lesson, SubscriptionTier, User


def _tier_of(user: Optional[User]) -> SubscriptionTier:
    return user.tier if user is not None else SubscriptionTier.FREE


def course_is_unlocked(user: Optional[User], course: Course) -> bool:
    """True when this user's tier is at or above what the course requires.

    Admins always pass, so the person authoring content can preview it without
    holding a subscription.
    """
    if user is not None and user.is_admin:
        return True
    return TIER_RANK[_tier_of(user)] >= TIER_RANK[course.required_tier]


def lesson_is_unlocked(user: Optional[User], lesson: Lesson) -> bool:
    """Preview lessons stay open regardless of tier - that is the whole point."""
    if lesson.is_preview:
        return True
    return course_is_unlocked(user, lesson.module.course)


def require_lesson_access(user: Optional[User], lesson: Lesson) -> None:
    if lesson_is_unlocked(user, lesson):
        return
    # 402 rather than 403: this is not "you may never see this", it is
    # "this needs a membership", which is what the frontend paywall keys off.
    raise HTTPException(
        status.HTTP_402_PAYMENT_REQUIRED,
        "This lesson is part of the E-motion membership.",
    )
