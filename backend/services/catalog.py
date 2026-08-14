"""Turning ORM rows into the per-viewer shapes the frontend renders.

Everything here takes the viewing user so lock state and progress are computed
once, in one place, rather than being recalculated (and drifting) per route.
"""
from typing import Dict, Iterable, List, Optional, Set

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Course, Enrollment, Lesson, LessonProgress, User, label_for
from schemas import CourseDetail, CourseSummary, LessonDetail, LessonSummary, ModuleOut

from .access import course_is_unlocked, lesson_is_unlocked


def completed_lesson_ids(db: Session, user: Optional[User], lesson_ids: Iterable[int]) -> Set[int]:
    ids = list(lesson_ids)
    if user is None or not ids:
        return set()
    rows = db.scalars(
        select(LessonProgress.lesson_id).where(
            LessonProgress.user_id == user.id,
            LessonProgress.lesson_id.in_(ids),
            LessonProgress.completed.is_(True),
        )
    ).all()
    return set(rows)


def _percent(done: int, total: int) -> int:
    return round(done * 100 / total) if total else 0


def build_course_summary(
    course: Course, user: Optional[User], completed: Set[int]
) -> CourseSummary:
    lessons = course.lessons_in_order
    done = sum(1 for lesson in lessons if lesson.id in completed)
    return CourseSummary(
        id=course.id,
        slug=course.slug,
        title=course.title,
        summary=course.summary,
        style=course.style,
        style_label=label_for(course.style),
        cover_image_url=course.cover_image_url,
        required_tier=course.required_tier,
        lesson_count=len(lessons),
        total_duration_seconds=sum(lesson.duration_seconds for lesson in lessons),
        is_locked=not course_is_unlocked(user, course),
        completed_lessons=done,
        progress_percent=_percent(done, len(lessons)),
    )


def build_course_summaries(
    db: Session, courses: List[Course], user: Optional[User]
) -> List[CourseSummary]:
    all_ids = [lesson.id for course in courses for lesson in course.lessons_in_order]
    completed = completed_lesson_ids(db, user, all_ids)
    return [build_course_summary(course, user, completed) for course in courses]


def resume_lesson_id(
    course: Course, completed: Set[int], enrollment: Optional[Enrollment]
) -> Optional[int]:
    """Where "Resume" should drop the student.

    Prefers the lesson they last opened. Otherwise the first one they have not
    finished, so a returning student lands on work rather than on the beginning.
    """
    lessons = course.lessons_in_order
    if not lessons:
        return None
    if enrollment is not None and enrollment.last_seen_lesson_id is not None:
        if any(lesson.id == enrollment.last_seen_lesson_id for lesson in lessons):
            return enrollment.last_seen_lesson_id
    for lesson in lessons:
        if lesson.id not in completed:
            return lesson.id
    return lessons[0].id


def build_course_detail(db: Session, course: Course, user: Optional[User]) -> CourseDetail:
    lessons = course.lessons_in_order
    completed = completed_lesson_ids(db, user, [lesson.id for lesson in lessons])

    enrollment = None
    if user is not None:
        enrollment = db.scalar(
            select(Enrollment).where(
                Enrollment.user_id == user.id, Enrollment.course_id == course.id
            )
        )

    summary = build_course_summary(course, user, completed)
    modules = [
        ModuleOut(
            id=module.id,
            title=module.title,
            description=module.description,
            sort_order=module.sort_order,
            lessons=[
                LessonSummary(
                    id=lesson.id,
                    title=lesson.title,
                    duration_seconds=lesson.duration_seconds,
                    sort_order=lesson.sort_order,
                    is_preview=lesson.is_preview,
                    is_locked=not lesson_is_unlocked(user, lesson),
                    is_completed=lesson.id in completed,
                )
                for lesson in module.lessons
            ],
        )
        for module in course.modules
    ]

    return CourseDetail(
        **summary.model_dump(),
        description=course.description,
        modules=modules,
        is_enrolled=enrollment is not None,
        resume_lesson_id=resume_lesson_id(course, completed, enrollment),
    )


def build_lesson_detail(db: Session, lesson: Lesson, user: Optional[User]) -> LessonDetail:
    course = lesson.module.course
    sequence = course.lessons_in_order
    index = next((i for i, item in enumerate(sequence) if item.id == lesson.id), 0)
    completed = completed_lesson_ids(db, user, [lesson.id])

    progress = None
    if user is not None:
        progress = db.scalar(
            select(LessonProgress).where(
                LessonProgress.user_id == user.id, LessonProgress.lesson_id == lesson.id
            )
        )

    return LessonDetail(
        id=lesson.id,
        title=lesson.title,
        duration_seconds=lesson.duration_seconds,
        sort_order=lesson.sort_order,
        is_preview=lesson.is_preview,
        is_locked=False,  # callers gate before building this
        is_completed=lesson.id in completed,
        position_seconds=progress.position_seconds if progress else 0,
        body=lesson.body,
        mux_playback_id=lesson.mux_playback_id,
        module_id=lesson.module_id,
        module_title=lesson.module.title,
        course_slug=course.slug,
        course_title=course.title,
        previous_lesson_id=sequence[index - 1].id if index > 0 else None,
        next_lesson_id=sequence[index + 1].id if index + 1 < len(sequence) else None,
        position=index + 1,
        total_in_course=len(sequence),
    )
