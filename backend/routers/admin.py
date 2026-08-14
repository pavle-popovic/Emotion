"""Admin authoring: course/module/lesson CRUD and the Mux video pipeline.

Every route here depends on require_admin. There is no per-instructor ownership
because E-motion is single-creator by design; if that ever changes, ownership
belongs on Course, not in these handlers.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from config import settings
from models import Course, Lesson, Module, User, get_db
from schemas_admin import (
    AdminCourse,
    AdminCourseDetail,
    AdminLesson,
    AdminModule,
    CourseCreate,
    CourseUpdate,
    DirectUpload,
    LessonCreate,
    LessonUpdate,
    ModuleCreate,
    ModuleUpdate,
)
from security import require_admin
from services import mux

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


# --- helpers ------------------------------------------------------------


def _course_or_404(db: Session, course_id: int) -> Course:
    course = db.scalar(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
    )
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    return course


def _module_or_404(db: Session, module_id: int) -> Module:
    module = db.scalar(
        select(Module).where(Module.id == module_id).options(selectinload(Module.lessons))
    )
    if module is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
    return module


def _lesson_or_404(db: Session, lesson_id: int) -> Lesson:
    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
    return lesson


def _next_order(values: List[int]) -> int:
    return (max(values) + 1) if values else 0


def _as_course(course: Course) -> AdminCourse:
    return AdminCourse(
        id=course.id,
        slug=course.slug,
        title=course.title,
        summary=course.summary,
        description=course.description,
        style=course.style,
        required_tier=course.required_tier,
        is_published=course.is_published,
        sort_order=course.sort_order,
        cover_image_url=course.cover_image_url,
        lesson_count=len(course.lessons_in_order),
    )


# --- courses ------------------------------------------------------------


@router.get("/courses", response_model=List[AdminCourse])
def list_courses(db: Session = Depends(get_db)):
    """Everything, published or not - the opposite of the public catalog."""
    courses = db.scalars(
        select(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .order_by(Course.sort_order, Course.id)
    ).unique().all()
    return [_as_course(course) for course in courses]


@router.post("/courses", response_model=AdminCourse, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    if db.scalar(select(Course).where(Course.slug == payload.slug)):
        raise HTTPException(status.HTTP_409_CONFLICT, "That slug is already taken")
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return _as_course(course)


@router.get("/courses/{course_id}", response_model=AdminCourseDetail)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = _course_or_404(db, course_id)
    return AdminCourseDetail(
        **_as_course(course).model_dump(),
        modules=[AdminModule.model_validate(m) for m in course.modules],
    )


@router.patch("/courses/{course_id}", response_model=AdminCourse)
def update_course(course_id: int, payload: CourseUpdate, db: Session = Depends(get_db)):
    course = _course_or_404(db, course_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return _as_course(course)


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = _course_or_404(db, course_id)
    db.delete(course)
    db.commit()


# --- modules ------------------------------------------------------------


@router.post(
    "/courses/{course_id}/modules", response_model=AdminModule, status_code=status.HTTP_201_CREATED
)
def create_module(course_id: int, payload: ModuleCreate, db: Session = Depends(get_db)):
    course = _course_or_404(db, course_id)
    order = payload.sort_order
    if order is None:
        order = _next_order([m.sort_order for m in course.modules])
    module = Module(
        course_id=course.id,
        title=payload.title,
        description=payload.description,
        sort_order=order,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return AdminModule.model_validate(module)


@router.patch("/modules/{module_id}", response_model=AdminModule)
def update_module(module_id: int, payload: ModuleUpdate, db: Session = Depends(get_db)):
    module = _module_or_404(db, module_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(module, field, value)
    db.commit()
    db.refresh(module)
    return AdminModule.model_validate(module)


@router.delete("/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(module_id: int, db: Session = Depends(get_db)):
    db.delete(_module_or_404(db, module_id))
    db.commit()


# --- lessons ------------------------------------------------------------


@router.post(
    "/modules/{module_id}/lessons", response_model=AdminLesson, status_code=status.HTTP_201_CREATED
)
def create_lesson(module_id: int, payload: LessonCreate, db: Session = Depends(get_db)):
    module = _module_or_404(db, module_id)
    order = payload.sort_order
    if order is None:
        order = _next_order([lesson.sort_order for lesson in module.lessons])
    lesson = Lesson(
        module_id=module.id,
        title=payload.title,
        body=payload.body,
        is_preview=payload.is_preview,
        duration_seconds=payload.duration_seconds,
        sort_order=order,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return AdminLesson.model_validate(lesson)


@router.patch("/lessons/{lesson_id}", response_model=AdminLesson)
def update_lesson(lesson_id: int, payload: LessonUpdate, db: Session = Depends(get_db)):
    lesson = _lesson_or_404(db, lesson_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(lesson, field, value)
    db.commit()
    db.refresh(lesson)
    return AdminLesson.model_validate(lesson)


@router.delete("/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    db.delete(_lesson_or_404(db, lesson_id))
    db.commit()


# --- video --------------------------------------------------------------


@router.post("/lessons/{lesson_id}/video/upload", response_model=DirectUpload)
def start_video_upload(lesson_id: int, db: Session = Depends(get_db)):
    """Hand the browser a signed URL so the file goes to Mux directly."""
    lesson = _lesson_or_404(db, lesson_id)
    origins = settings.cors_origins
    upload = mux.create_direct_upload(cors_origin=origins[0] if origins else "*")

    lesson.mux_upload_id = upload["id"]
    lesson.mux_status = "uploading"
    db.commit()
    return DirectUpload(upload_id=upload["id"], upload_url=upload["url"])


@router.post("/lessons/{lesson_id}/video/sync", response_model=AdminLesson)
def sync_video(lesson_id: int, db: Session = Depends(get_db)):
    """Poll Mux and attach the playback id once encoding finishes.

    Called repeatedly by the admin UI after an upload. Safe to call at any point:
    it reports whatever state Mux is in rather than assuming progress.
    """
    lesson = _lesson_or_404(db, lesson_id)
    if not lesson.mux_upload_id and not lesson.mux_asset_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No Mux upload for this lesson")

    asset_id = lesson.mux_asset_id
    if asset_id is None:
        upload = mux.get_upload(lesson.mux_upload_id)
        asset_id = upload.get("asset_id")
        if asset_id is None:
            # Still waiting for the browser to finish PUTting the file.
            lesson.mux_status = upload.get("status", "uploading")
            db.commit()
            db.refresh(lesson)
            return AdminLesson.model_validate(lesson)
        lesson.mux_asset_id = asset_id

    asset = mux.get_asset(asset_id)
    lesson.mux_status = asset.get("status", "unknown")

    if lesson.mux_status == "ready":
        playback_id = mux.public_playback_id(asset)
        if playback_id:
            lesson.mux_playback_id = playback_id
        seconds = asset.get("duration")
        if seconds:
            lesson.duration_seconds = int(round(float(seconds)))

    db.commit()
    db.refresh(lesson)
    return AdminLesson.model_validate(lesson)


@router.delete("/lessons/{lesson_id}/video", response_model=AdminLesson)
def remove_video(lesson_id: int, db: Session = Depends(get_db)):
    """Detach and delete the Mux asset. Storage is billed, so orphans cost money."""
    lesson = _lesson_or_404(db, lesson_id)
    if lesson.mux_asset_id:
        try:
            mux.delete_asset(lesson.mux_asset_id)
        except HTTPException as exc:
            # Already gone from Mux: still clear our side rather than deadlock.
            if exc.status_code != status.HTTP_404_NOT_FOUND:
                raise

    lesson.mux_asset_id = None
    lesson.mux_upload_id = None
    lesson.mux_playback_id = None
    lesson.mux_status = "none"
    db.commit()
    db.refresh(lesson)
    return AdminLesson.model_validate(lesson)
