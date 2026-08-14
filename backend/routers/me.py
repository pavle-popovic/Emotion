from datetime import date, datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from models import (
    Course,
    Enrollment,
    LessonProgress,
    Module,
    Subscription,
    SubscriptionStatus,
    SubscriptionTier,
    User,
    get_db,
)

TRIAL_DAYS = 7
from schemas import (
    ContinueCard,
    CourseSummary,
    Dashboard,
    DashboardStats,
    OnboardingRequest,
    PasswordChange,
    ProfileUpdate,
    UserOut,
)
from security import get_current_user, hash_password, verify_password
from services import build_course_summaries, completed_lesson_ids, resume_lesson_id

router = APIRouter(prefix="/me", tags=["me"])


def serialize_user(user: User) -> UserOut:
    sub = user.subscription
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        avatar_url=user.avatar_url,
        preferred_style=user.preferred_style,
        is_onboarded=user.onboarded_at is not None,
        tier=user.tier,
        subscription=(
            None
            if sub is None
            else {
                "tier": sub.tier,
                "status": sub.status,
                "current_period_end": sub.current_period_end,
            }
        ),
    )


def _day_streak(db: Session, user: User) -> int:
    """Consecutive days ending today (or yesterday) on which something was completed.

    Counting from yesterday too means the streak does not visibly reset the moment
    midnight passes and before that day's practice.
    """
    rows = db.scalars(
        select(LessonProgress.completed_at)
        .where(LessonProgress.user_id == user.id, LessonProgress.completed.is_(True))
        .order_by(LessonProgress.completed_at.desc())
    ).all()
    days = sorted({row.date() for row in rows if row is not None}, reverse=True)
    if not days:
        return 0

    today = date.today()
    if days[0] not in (today, today - timedelta(days=1)):
        return 0

    streak, cursor = 1, days[0]
    for day in days[1:]:
        if day == cursor - timedelta(days=1):
            streak += 1
            cursor = day
        else:
            break
    return streak


@router.get("", response_model=UserOut)
def read_me(user: User = Depends(get_current_user)):
    return serialize_user(user)


@router.post("/onboarding", response_model=UserOut)
def complete_onboarding(
    payload: OnboardingRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    user.preferred_style = payload.preferred_style
    user.onboarded_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.patch("", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)
    if "full_name" in data and data["full_name"] is not None:
        user.full_name = data["full_name"].strip()
    if "preferred_style" in data and data["preferred_style"] is not None:
        user.preferred_style = data["preferred_style"]
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Self-service password change.

    Requires the current password even though the caller is authenticated: a
    borrowed session should not be enough to lock the real owner out.
    """
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "That is not your current password.")
    if payload.current_password == payload.new_password:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Choose a different password.")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()


@router.post("/start-trial", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def start_trial(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Begin the 7-day free trial the landing page advertises.

    No card is taken. This is deliberately the seam Stripe will replace: when
    billing lands, Checkout creates the Subscription row instead and this route
    goes away. Until then it is what makes the product usable end to end.

    One trial per account - a second call returns the existing subscription
    rather than granting another week.
    """
    if user.subscription is None:
        db.add(
            Subscription(
                user_id=user.id,
                tier=SubscriptionTier.MEMBER,
                status=SubscriptionStatus.TRIALING,
                current_period_end=datetime.now(timezone.utc) + timedelta(days=TRIAL_DAYS),
            )
        )
        db.commit()
        db.refresh(user)
    return serialize_user(user)


@router.get("/courses", response_model=List[CourseSummary])
def my_courses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    courses = list(
        db.scalars(
            select(Course)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .where(Enrollment.user_id == user.id, Course.is_published.is_(True))
            .options(selectinload(Course.modules).selectinload(Module.lessons))
            .order_by(Enrollment.enrolled_at.desc())
        )
        .unique()
        .all()
    )
    return build_course_summaries(db, courses, user)


@router.get("/dashboard", response_model=Dashboard)
def dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    enrolled = list(
        db.scalars(
            select(Course)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .where(Enrollment.user_id == user.id, Course.is_published.is_(True))
            .options(selectinload(Course.modules).selectinload(Module.lessons))
            .order_by(Enrollment.enrolled_at.desc())
        )
        .unique()
        .all()
    )
    summaries = build_course_summaries(db, enrolled, user)

    lessons_completed = db.scalar(
        select(func.count())
        .select_from(LessonProgress)
        .where(LessonProgress.user_id == user.id, LessonProgress.completed.is_(True))
    )

    return Dashboard(
        stats=DashboardStats(
            lessons_completed=lessons_completed,
            courses_completed=sum(1 for c in summaries if c.progress_percent == 100),
            day_streak=_day_streak(db, user),
        ),
        continue_card=_continue_card(db, enrolled, user),
        courses=summaries,
    )


def _continue_card(db: Session, courses: List[Course], user: User) -> Optional[ContinueCard]:
    """The most recently touched course that still has unfinished lessons."""
    enrollments = {
        e.course_id: e
        for e in db.scalars(select(Enrollment).where(Enrollment.user_id == user.id)).all()
    }

    for course in courses:
        lessons = course.lessons_in_order
        if not lessons:
            continue
        completed = completed_lesson_ids(db, user, [lesson.id for lesson in lessons])
        if len(completed) >= len(lessons):
            continue

        target_id = resume_lesson_id(course, completed, enrollments.get(course.id))
        target = next((lesson for lesson in lessons if lesson.id == target_id), None)
        if target is None:
            continue

        position = next(i for i, lesson in enumerate(lessons) if lesson.id == target.id) + 1
        return ContinueCard(
            course_slug=course.slug,
            course_title=course.title,
            lesson_id=target.id,
            lesson_title=target.title,
            position=position,
            total_in_course=len(lessons),
            progress_percent=round(len(completed) * 100 / len(lessons)),
        )
    return None
