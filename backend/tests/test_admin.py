"""Admin authoring routes.

The access tests matter most: these endpoints can publish, unpublish and delete
the whole catalog, so a student reaching them is the worst bug in this file.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

from main import app
from models import get_engine
from scripts.create_admin import upsert_admin

ADMIN_EMAIL = "pytest-admin@example.com"
STUDENT_EMAIL = "pytest-student@example.com"
PASSWORD = "correct-horse-battery-staple"


def _wipe(*emails):
    with get_engine().begin() as conn:
        for email in emails:
            conn.execute(text("delete from users where email = :e"), {"e": email})


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def admin_headers(client):
    _wipe(ADMIN_EMAIL)
    with Session(get_engine()) as session:
        upsert_admin(session, ADMIN_EMAIL, PASSWORD, full_name="Pytest Admin")
    res = client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": PASSWORD})
    assert res.status_code == 200, res.text
    yield {"Authorization": f"Bearer {res.json()['access_token']}"}
    _wipe(ADMIN_EMAIL)


@pytest.fixture()
def student_headers(client):
    _wipe(STUDENT_EMAIL)
    res = client.post("/api/auth/register", json={"email": STUDENT_EMAIL, "password": PASSWORD})
    assert res.status_code == 201
    yield {"Authorization": f"Bearer {res.json()['access_token']}"}
    _wipe(STUDENT_EMAIL)


@pytest.fixture()
def scratch_course(client, admin_headers):
    """A throwaway course, deleted afterwards so the seeded catalog is untouched."""
    res = client.post(
        "/api/admin/courses",
        json={"slug": "pytest-scratch", "title": "Pytest Scratch", "style": "hip_hop"},
        headers=admin_headers,
    )
    assert res.status_code == 201, res.text
    course = res.json()
    yield course
    client.delete(f"/api/admin/courses/{course['id']}", headers=admin_headers)


# --- access -------------------------------------------------------------


ADMIN_GETS = ["/api/admin/courses"]


@pytest.mark.parametrize("path", ADMIN_GETS)
def test_admin_routes_reject_anonymous(client, path):
    assert client.get(path).status_code == 401


@pytest.mark.parametrize("path", ADMIN_GETS)
def test_admin_routes_reject_students(client, student_headers, path):
    assert client.get(path, headers=student_headers).status_code == 403


def test_students_cannot_create_courses(client, student_headers):
    res = client.post(
        "/api/admin/courses",
        json={"slug": "nope", "title": "Nope"},
        headers=student_headers,
    )
    assert res.status_code == 403


def test_students_cannot_delete_courses(client, student_headers, scratch_course):
    res = client.delete(f"/api/admin/courses/{scratch_course['id']}", headers=student_headers)
    assert res.status_code == 403


# --- courses ------------------------------------------------------------


def test_admin_sees_unpublished_courses(client, admin_headers, scratch_course):
    slugs = {c["slug"] for c in client.get("/api/admin/courses", headers=admin_headers).json()}
    assert scratch_course["slug"] in slugs
    assert scratch_course["is_published"] is False

    public = {c["slug"] for c in client.get("/api/courses").json()}
    assert scratch_course["slug"] not in public, "unpublished course leaked into the public catalog"


def test_publishing_puts_a_course_in_the_catalog(client, admin_headers, scratch_course):
    res = client.patch(
        f"/api/admin/courses/{scratch_course['id']}",
        json={"is_published": True},
        headers=admin_headers,
    )
    assert res.status_code == 200 and res.json()["is_published"] is True

    public = {c["slug"] for c in client.get("/api/courses").json()}
    assert scratch_course["slug"] in public


def test_duplicate_slug_is_rejected(client, admin_headers, scratch_course):
    res = client.post(
        "/api/admin/courses",
        json={"slug": scratch_course["slug"], "title": "Clash"},
        headers=admin_headers,
    )
    assert res.status_code == 409


# --- structure ----------------------------------------------------------


def test_modules_and_lessons_autoincrement_their_order(client, admin_headers, scratch_course):
    course_id = scratch_course["id"]
    first = client.post(
        f"/api/admin/courses/{course_id}/modules",
        json={"title": "Module one"},
        headers=admin_headers,
    ).json()
    second = client.post(
        f"/api/admin/courses/{course_id}/modules",
        json={"title": "Module two"},
        headers=admin_headers,
    ).json()
    assert first["sort_order"] == 0 and second["sort_order"] == 1

    a = client.post(
        f"/api/admin/modules/{first['id']}/lessons",
        json={"title": "Lesson A"},
        headers=admin_headers,
    ).json()
    b = client.post(
        f"/api/admin/modules/{first['id']}/lessons",
        json={"title": "Lesson B"},
        headers=admin_headers,
    ).json()
    assert a["sort_order"] == 0 and b["sort_order"] == 1
    assert a["mux_status"] == "none" and a["mux_playback_id"] is None

    detail = client.get(f"/api/admin/courses/{course_id}", headers=admin_headers).json()
    assert [m["title"] for m in detail["modules"]] == ["Module one", "Module two"]
    assert len(detail["modules"][0]["lessons"]) == 2


def test_deleting_a_module_removes_its_lessons(client, admin_headers, scratch_course):
    course_id = scratch_course["id"]
    module = client.post(
        f"/api/admin/courses/{course_id}/modules",
        json={"title": "Doomed"},
        headers=admin_headers,
    ).json()
    lesson = client.post(
        f"/api/admin/modules/{module['id']}/lessons",
        json={"title": "Also doomed"},
        headers=admin_headers,
    ).json()

    assert client.delete(f"/api/admin/modules/{module['id']}", headers=admin_headers).status_code == 204
    assert client.patch(
        f"/api/admin/lessons/{lesson['id']}", json={"title": "x"}, headers=admin_headers
    ).status_code == 404


def test_lesson_can_be_edited_and_marked_preview(client, admin_headers, scratch_course):
    module = client.post(
        f"/api/admin/courses/{scratch_course['id']}/modules",
        json={"title": "M"},
        headers=admin_headers,
    ).json()
    lesson = client.post(
        f"/api/admin/modules/{module['id']}/lessons",
        json={"title": "Draft title"},
        headers=admin_headers,
    ).json()

    res = client.patch(
        f"/api/admin/lessons/{lesson['id']}",
        json={"title": "Final title", "is_preview": True, "body": "Notes"},
        headers=admin_headers,
    )
    assert res.status_code == 200
    assert res.json()["title"] == "Final title"
    assert res.json()["is_preview"] is True


def test_video_sync_without_an_upload_is_a_400(client, admin_headers, scratch_course):
    module = client.post(
        f"/api/admin/courses/{scratch_course['id']}/modules",
        json={"title": "M"},
        headers=admin_headers,
    ).json()
    lesson = client.post(
        f"/api/admin/modules/{module['id']}/lessons",
        json={"title": "No video"},
        headers=admin_headers,
    ).json()

    res = client.post(f"/api/admin/lessons/{lesson['id']}/video/sync", headers=admin_headers)
    assert res.status_code == 400
