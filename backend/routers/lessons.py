from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from models import Course, Enrollment, Lesson, LessonProgress, Module, User, get_db
from schemas import LessonDetail, PositionUpdate, ProgressUpdate
from security import get_current_user, get_current_user_optional
from services import build_lesson_detail, require_lesson_access

router = APIRouter(prefix="/lessons", tags=["lessons"])


def _load(db: Session, lesson_id: int) -> Lesson:
    lesson = db.scalar(
        select(Lesson)
        .where(Lesson.id == lesson_id)
        .options(
            selectinload(Lesson.module)
            .selectinload(Module.course)
            .selectinload(Course.modules)
            .selectinload(Module.lessons)
        )
    )
    if lesson is None or not lesson.module.course.is_published:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
    return lesson


@router.get("/{lesson_id}", response_model=LessonDetail)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    lesson = _load(db, lesson_id)
    require_lesson_access(user, lesson)

    # Remember where they were, so "Resume" is accurate next time.
    if user is not None:
        enrollment = db.scalar(
            select(Enrollment).where(
                Enrollment.user_id == user.id,
                Enrollment.course_id == lesson.module.course_id,
            )
        )
        if enrollment is None:
            enrollment = Enrollment(user_id=user.id, course_id=lesson.module.course_id)
            db.add(enrollment)
        enrollment.last_seen_lesson_id = lesson.id
        db.commit()

    return build_lesson_detail(db, lesson, user)


@router.put("/{lesson_id}/progress", response_model=LessonDetail)
def set_progress(
    lesson_id: int,
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark a lesson complete or drop it back to incomplete."""
    lesson = _load(db, lesson_id)
    require_lesson_access(user, lesson)

    progress = db.scalar(
        select(LessonProgress).where(
            LessonProgress.user_id == user.id, LessonProgress.lesson_id == lesson.id
        )
    )
    if progress is None:
        progress = LessonProgress(user_id=user.id, lesson_id=lesson.id)
        db.add(progress)

    progress.completed = payload.completed
    progress.completed_at = datetime.now(timezone.utc) if payload.completed else None
    db.commit()

    return build_lesson_detail(db, lesson, user)


@router.put("/{lesson_id}/position", status_code=status.HTTP_204_NO_CONTENT)
def save_position(
    lesson_id: int,
    payload: PositionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Remember where playback stopped.

    Deliberately returns 204 and builds no response body: the player calls this
    every few seconds and does not need anything back.
    """
    lesson = _load(db, lesson_id)
    require_lesson_access(user, lesson)

    progress = db.scalar(
        select(LessonProgress).where(
            LessonProgress.user_id == user.id, LessonProgress.lesson_id == lesson.id
        )
    )
    if progress is None:
        progress = LessonProgress(user_id=user.id, lesson_id=lesson.id)
        db.add(progress)

    progress.position_seconds = payload.position_seconds
    db.commit()
