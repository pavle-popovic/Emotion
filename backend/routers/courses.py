from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from models import Course, DanceStyle, Enrollment, Module, User, get_db
from schemas import CourseDetail, CourseSummary
from security import get_current_user, get_current_user_optional
from services import build_course_detail, build_course_summaries

router = APIRouter(prefix="/courses", tags=["courses"])


def _published_query():
    return (
        select(Course)
        .where(Course.is_published.is_(True))
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .order_by(Course.sort_order, Course.id)
    )


@router.get("", response_model=List[CourseSummary])
def list_courses(
    style: Optional[DanceStyle] = Query(None, description="Filter to a single dance style"),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    """Published catalog. Renders for signed-out visitors, personalised when signed in."""
    query = _published_query()
    if style is not None:
        query = query.where(Course.style == style)
    return build_course_summaries(db, list(db.scalars(query).unique().all()), user)


@router.get("/{slug}", response_model=CourseDetail)
def get_course(
    slug: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    course = db.scalar(_published_query().where(Course.slug == slug))
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    return build_course_detail(db, course, user)


@router.post("/{slug}/enroll", response_model=CourseDetail, status_code=status.HTTP_201_CREATED)
def enroll(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Add a course to "My courses". Idempotent - re-enrolling is not an error."""
    course = db.scalar(_published_query().where(Course.slug == slug))
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")

    existing = db.scalar(
        select(Enrollment).where(Enrollment.user_id == user.id, Enrollment.course_id == course.id)
    )
    if existing is None:
        db.add(Enrollment(user_id=user.id, course_id=course.id))
        db.commit()

    return build_course_detail(db, course, user)
