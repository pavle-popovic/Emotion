"""Seed the catalog shown in the E-motion design.

Idempotent: re-running updates existing courses by slug rather than duplicating.
Run from backend/ with `python -m scripts.seed_demo`.

Lessons carry no mux_playback_id yet - video gets attached once the Mux
environment exists. Every course renders and is walkable without it.

Course covers are the Sanjay portraits in frontend/public/courses/, one per
course, picked so no two cards share a backdrop.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Course, DanceStyle, Lesson, Module, SubscriptionTier, get_engine

COURSES = [
    {
        "slug": "hip-hop-foundations",
        "title": "Hip Hop Foundations",
        "style": DanceStyle.HIP_HOP,
        "summary": "Groove, bounce and the freedom to freestyle.",
        "description": (
            "Start where every hip hop dancer starts: the bounce. You will build a "
            "groove that sits in the music instead of on top of it, then layer in "
            "rock, skate and the classic party steps."
        ),
        "required_tier": SubscriptionTier.FREE,
        "modules": [
            ("Find the bounce", ["What groove actually is", "Down bounce", "Up bounce", "Switching between them"]),
            ("Party steps", ["The Reebok", "Party machine", "Happy feet", "Putting three together"]),
            ("Your first freestyle", ["Freestyle without panic", "Repeat and vary", "One minute, no stopping"]),
        ],
    },
    {
        "slug": "kizomba-from-zero",
        "title": "Kizomba From Zero",
        "style": DanceStyle.KIZOMBA,
        "summary": "Connection and flow, built from the ground up.",
        "description": (
            "Kizomba is walking made musical. This course builds your posture, your "
            "weight transfer and the quiet control that makes the walk feel like one "
            "long breath."
        ),
        "required_tier": SubscriptionTier.MEMBER,
        "modules": [
            ("Posture and weight", ["Standing like a dancer", "Weight transfer", "Slow walk", "Walking to music"]),
            ("The basics", ["Basic 1", "Basic 2", "Basic 3", "Linking the basics"]),
            ("Musical walking", ["Hearing the pulse", "Pausing on purpose", "Walking a whole song"]),
        ],
    },
    {
        "slug": "bachata-essentials",
        "title": "Bachata Essentials",
        "style": DanceStyle.BACHATA,
        "summary": "Sensual waves and footwork that actually lands on the beat.",
        "description": (
            "The full base of modern bachata: the side basic, the tap, the hip motion "
            "that comes from the floor rather than the waist, and body waves broken "
            "down slowly enough to actually learn."
        ),
        "required_tier": SubscriptionTier.MEMBER,
        "modules": [
            ("Basic steps", ["Side basic", "The tap", "Forward and back", "Basic to music"]),
            ("Hips and body", ["Where hip motion comes from", "Isolating the ribs", "Body roll, slowly", "Full body wave"]),
            ("Footwork", ["Syncopation", "Simple turn", "Footwork into a turn"]),
        ],
    },
    {
        "slug": "afrobeats-grooves",
        "title": "Afrobeats Grooves",
        "style": DanceStyle.AFROBEATS,
        "summary": "Energy, legwork and joy.",
        "description": (
            "Afrobeats rewards commitment more than precision. Learn the core grooves, "
            "then the legwork that lets you throw yourself into them without losing "
            "the beat."
        ),
        "required_tier": SubscriptionTier.MEMBER,
        "modules": [
            ("Core grooves", ["Shoulder bounce", "Zanku basics", "Gwara gwara", "Switching grooves"]),
            ("Legwork", ["Light feet", "Speed control", "Legwork in a circle"]),
        ],
    },
    {
        "slug": "musicality-and-how-to-practice",
        "title": "Musicality & How to Practice",
        "style": DanceStyle.ALL_STYLES,
        "summary": "Hear more, and get more from every hour you practise.",
        "description": (
            "The course that makes the other four work faster. How to hear structure, "
            "how to count without counting out loud, and how to run a practice session "
            "that actually changes how you move."
        ),
        "required_tier": SubscriptionTier.MEMBER,
        "modules": [
            ("Hearing the music", ["Finding the 1", "Phrases of eight", "Instruments to dance to"]),
            ("How to practise", ["The 20 minute session", "Filming yourself", "Practising slowly on purpose"]),
        ],
    },
]


def seed(session: Session) -> None:
    for order, spec in enumerate(COURSES):
        course = session.scalar(select(Course).where(Course.slug == spec["slug"]))
        if course is None:
            course = Course(slug=spec["slug"])
            session.add(course)

        course.title = spec["title"]
        course.summary = spec["summary"]
        course.description = spec["description"]
        course.style = spec["style"]
        course.required_tier = spec["required_tier"]
        # Covers ship with the frontend, so the path is stable and needs no CDN.
        course.cover_image_url = f"/courses/{spec['slug']}.jpg"
        course.is_published = True
        course.sort_order = order

        # Rebuilding modules deletes their lessons, and with them any Mux
        # playback ids - which would orphan assets we are still paying to store.
        # Once a course has real video, only its copy is refreshed.
        has_video = any(
            lesson.mux_asset_id for module in course.modules for lesson in module.lessons
        )
        if has_video:
            session.commit()
            print(f"  {course.slug}: has video, left its lessons alone")
            continue

        course.modules.clear()
        session.flush()

        for m_order, (module_title, lesson_titles) in enumerate(spec["modules"]):
            module = Module(title=module_title, sort_order=m_order, description="")
            course.modules.append(module)
            for l_order, lesson_title in enumerate(lesson_titles):
                module.lessons.append(
                    Lesson(
                        title=lesson_title,
                        sort_order=l_order,
                        duration_seconds=240 + (l_order * 45),
                        body=(
                            f"{lesson_title}. Watch once all the way through, then run "
                            "it again at 0.75x and mirror it until it stops feeling new."
                        ),
                        # First lesson of every course is a free taste, even on
                        # member-only courses. This is what the landing page links to.
                        is_preview=(m_order == 0 and l_order == 0),
                    )
                )

        session.commit()
        total = sum(len(m.lessons) for m in course.modules)
        print(f"  {course.slug}: {len(course.modules)} modules, {total} lessons")


if __name__ == "__main__":
    with Session(get_engine()) as session:
        print("Seeding catalog...")
        seed(session)
    print("Done.")
