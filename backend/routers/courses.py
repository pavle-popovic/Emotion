from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Course, get_db
from schemas import CourseDetail, CourseSummary

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=List[CourseSummary])
def list_courses(db: Session = Depends(get_db)):
    """Published catalog, in author-defined order."""
    rows = db.scalars(
        select(Course).where(Course.is_published.is_(True)).order_by(Course.sort_order, Course.id)
    ).all()
    return list(rows)


@router.get("/{slug}", response_model=CourseDetail)
def get_course(slug: str, db: Session = Depends(get_db)):
    course = db.scalar(select(Course).where(Course.slug == slug))
    if course is None or not course.is_published:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    return course
