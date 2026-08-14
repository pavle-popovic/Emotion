"""Catalog, tier gating and progress.

Runs against the seeded catalog (`python -m scripts.seed_demo`). The gating tests
are the important ones: a mistake there leaks paid lessons.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, text

from main import app
from models import Course, get_engine, get_session_local

FREE_COURSE = "hip-hop-foundations"
MEMBER_COURSE = "bachata-essentials"
PASSWORD = "correct-horse-battery-staple"


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def account(client):
    """A fresh registered account, torn down afterwards."""
    email = "pytest-catalog@example.com"
    with get_engine().begin() as conn:
        conn.execute(text("delete from users where email = :e"), {"e": email})

    res = client.post("/api/auth/register", json={"email": email, "password": PASSWORD})
    assert res.status_code == 201, res.text
    token = res.json()["access_token"]
    yield {"email": email, "headers": {"Authorization": f"Bearer {token}"}}

    with get_engine().begin() as conn:
        conn.execute(text("delete from users where email = :e"), {"e": email})


def _lesson_ids(client, slug, headers=None):
    res = client.get(f"/api/courses/{slug}", headers=headers or {})
    assert res.status_code == 200, res.text
    body = res.json()
    return body, [lesson for module in body["modules"] for lesson in module["lessons"]]


# --- catalog ------------------------------------------------------------


def test_catalog_lists_published_courses(client):
    res = client.get("/api/courses")
    assert res.status_code == 200
    slugs = {c["slug"] for c in res.json()}
    assert {FREE_COURSE, MEMBER_COURSE} <= slugs


def test_catalog_filters_by_style(client):
    res = client.get("/api/courses", params={"style": "bachata"})
    assert res.status_code == 200
    assert {c["style"] for c in res.json()} == {"bachata"}


def test_catalog_reports_lock_state_to_anonymous(client):
    by_slug = {c["slug"]: c for c in client.get("/api/courses").json()}
    assert by_slug[FREE_COURSE]["is_locked"] is False
    assert by_slug[MEMBER_COURSE]["is_locked"] is True


def test_unknown_course_is_404(client):
    assert client.get("/api/courses/does-not-exist").status_code == 404


# --- gating -------------------------------------------------------------


def test_anonymous_can_open_a_free_course_lesson(client):
    _, lessons = _lesson_ids(client, FREE_COURSE)
    assert client.get(f"/api/lessons/{lessons[1]['id']}").status_code == 200


def test_anonymous_can_open_the_preview_lesson_of_a_paid_course(client):
    _, lessons = _lesson_ids(client, MEMBER_COURSE)
    preview = next(l for l in lessons if l["is_preview"])
    assert preview["is_locked"] is False
    assert client.get(f"/api/lessons/{preview['id']}").status_code == 200


def test_paid_lessons_are_402_without_a_membership(client, account):
    _, lessons = _lesson_ids(client, MEMBER_COURSE, account["headers"])
    locked = [l for l in lessons if not l["is_preview"]]
    assert locked, "seed should leave non-preview lessons on a member course"
    assert all(l["is_locked"] for l in locked)

    res = client.get(f"/api/lessons/{locked[0]['id']}", headers=account["headers"])
    assert res.status_code == 402, res.text


def test_trial_unlocks_paid_lessons(client, account):
    _, before = _lesson_ids(client, MEMBER_COURSE, account["headers"])
    locked = next(l for l in before if not l["is_preview"])

    trial = client.post("/api/me/start-trial", headers=account["headers"])
    assert trial.status_code == 201, trial.text
    assert trial.json()["tier"] == "member"
    assert trial.json()["subscription"]["status"] == "trialing"

    res = client.get(f"/api/lessons/{locked['id']}", headers=account["headers"])
    assert res.status_code == 200, res.text

    body, _ = _lesson_ids(client, MEMBER_COURSE, account["headers"])
    assert body["is_locked"] is False


def test_trial_cannot_be_claimed_twice(client, account):
    first = client.post("/api/me/start-trial", headers=account["headers"])
    second = client.post("/api/me/start-trial", headers=account["headers"])
    assert first.status_code == 201 and second.status_code == 201
    assert first.json()["subscription"]["current_period_end"] == (
        second.json()["subscription"]["current_period_end"]
    )


def test_marking_progress_requires_access(client, account):
    _, lessons = _lesson_ids(client, MEMBER_COURSE, account["headers"])
    locked = next(l for l in lessons if not l["is_preview"])
    res = client.put(
        f"/api/lessons/{locked['id']}/progress",
        json={"completed": True},
        headers=account["headers"],
    )
    assert res.status_code == 402


# --- progress -----------------------------------------------------------


def test_completing_lessons_moves_course_progress(client, account):
    _, lessons = _lesson_ids(client, FREE_COURSE, account["headers"])
    first = lessons[0]

    res = client.put(
        f"/api/lessons/{first['id']}/progress",
        json={"completed": True},
        headers=account["headers"],
    )
    assert res.status_code == 200
    assert res.json()["is_completed"] is True

    body, _ = _lesson_ids(client, FREE_COURSE, account["headers"])
    assert body["completed_lessons"] == 1
    assert body["progress_percent"] > 0

    # and it can be undone
    res = client.put(
        f"/api/lessons/{first['id']}/progress",
        json={"completed": False},
        headers=account["headers"],
    )
    assert res.json()["is_completed"] is False


def test_opening_a_lesson_sets_the_resume_point(client, account):
    _, lessons = _lesson_ids(client, FREE_COURSE, account["headers"])
    target = lessons[2]
    client.get(f"/api/lessons/{target['id']}", headers=account["headers"])

    body, _ = _lesson_ids(client, FREE_COURSE, account["headers"])
    assert body["resume_lesson_id"] == target["id"]
    assert body["is_enrolled"] is True


def test_lesson_detail_exposes_neighbours(client, account):
    _, lessons = _lesson_ids(client, FREE_COURSE, account["headers"])
    middle = client.get(f"/api/lessons/{lessons[1]['id']}", headers=account["headers"]).json()
    assert middle["previous_lesson_id"] == lessons[0]["id"]
    assert middle["next_lesson_id"] == lessons[2]["id"]
    assert middle["position"] == 2
    assert middle["total_in_course"] == len(lessons)

    first = client.get(f"/api/lessons/{lessons[0]['id']}", headers=account["headers"]).json()
    assert first["previous_lesson_id"] is None


# --- dashboard ----------------------------------------------------------


def test_dashboard_is_private(client):
    assert client.get("/api/me/dashboard").status_code == 401


def test_dashboard_surfaces_a_continue_card(client, account):
    _, lessons = _lesson_ids(client, FREE_COURSE, account["headers"])
    client.post(f"/api/courses/{FREE_COURSE}/enroll", headers=account["headers"])
    client.put(
        f"/api/lessons/{lessons[0]['id']}/progress",
        json={"completed": True},
        headers=account["headers"],
    )

    res = client.get("/api/me/dashboard", headers=account["headers"])
    assert res.status_code == 200
    body = res.json()
    assert body["stats"]["lessons_completed"] == 1
    assert body["stats"]["day_streak"] == 1
    card = body["continue_card"]
    assert card is not None
    assert card["course_slug"] == FREE_COURSE
    assert card["lesson_id"] == lessons[1]["id"], "should point at the next unfinished lesson"


def test_onboarding_records_the_chosen_style(client, account):
    res = client.post(
        "/api/me/onboarding", json={"preferred_style": "kizomba"}, headers=account["headers"]
    )
    assert res.status_code == 200
    assert res.json()["preferred_style"] == "kizomba"
    assert res.json()["is_onboarded"] is True


def test_enrolling_twice_is_not_an_error(client, account):
    a = client.post(f"/api/courses/{FREE_COURSE}/enroll", headers=account["headers"])
    b = client.post(f"/api/courses/{FREE_COURSE}/enroll", headers=account["headers"])
    assert a.status_code == 201 and b.status_code == 201
    assert len(client.get("/api/me/courses", headers=account["headers"]).json()) == 1
