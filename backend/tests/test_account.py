"""Resume position, profile edits and password changes."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from main import app
from models import get_engine

EMAIL = "pytest-account@example.com"
PASSWORD = "correct-horse-battery-staple"
NEW_PASSWORD = "a-completely-different-one"
FREE_COURSE = "hip-hop-foundations"


def _wipe():
    with get_engine().begin() as conn:
        conn.execute(text("delete from users where email = :e"), {"e": EMAIL})


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def headers(client):
    _wipe()
    res = client.post(
        "/api/auth/register",
        json={"email": EMAIL, "password": PASSWORD, "full_name": "Before"},
    )
    assert res.status_code == 201, res.text
    yield {"Authorization": f"Bearer {res.json()['access_token']}"}
    _wipe()


def _first_lesson_id(client, headers):
    body = client.get(f"/api/courses/{FREE_COURSE}", headers=headers).json()
    return body["modules"][0]["lessons"][0]["id"]


# --- resume position ----------------------------------------------------


def test_position_starts_at_zero(client, headers):
    lesson_id = _first_lesson_id(client, headers)
    body = client.get(f"/api/lessons/{lesson_id}", headers=headers).json()
    assert body["position_seconds"] == 0


def test_position_is_saved_and_returned(client, headers):
    lesson_id = _first_lesson_id(client, headers)

    res = client.put(
        f"/api/lessons/{lesson_id}/position",
        json={"position_seconds": 137},
        headers=headers,
    )
    assert res.status_code == 204

    body = client.get(f"/api/lessons/{lesson_id}", headers=headers).json()
    assert body["position_seconds"] == 137


def test_position_survives_being_overwritten(client, headers):
    lesson_id = _first_lesson_id(client, headers)
    client.put(f"/api/lessons/{lesson_id}/position", json={"position_seconds": 10}, headers=headers)
    client.put(f"/api/lessons/{lesson_id}/position", json={"position_seconds": 90}, headers=headers)
    assert client.get(f"/api/lessons/{lesson_id}", headers=headers).json()["position_seconds"] == 90


def test_position_rejects_negative_values(client, headers):
    lesson_id = _first_lesson_id(client, headers)
    res = client.put(
        f"/api/lessons/{lesson_id}/position", json={"position_seconds": -5}, headers=headers
    )
    assert res.status_code == 422


def test_position_requires_auth(client, headers):
    lesson_id = _first_lesson_id(client, headers)
    assert client.put(f"/api/lessons/{lesson_id}/position", json={"position_seconds": 5}).status_code == 401


def test_marking_complete_does_not_wipe_the_position(client, headers):
    lesson_id = _first_lesson_id(client, headers)
    client.put(f"/api/lessons/{lesson_id}/position", json={"position_seconds": 55}, headers=headers)
    client.put(f"/api/lessons/{lesson_id}/progress", json={"completed": True}, headers=headers)

    body = client.get(f"/api/lessons/{lesson_id}", headers=headers).json()
    assert body["is_completed"] is True
    assert body["position_seconds"] == 55


# --- profile ------------------------------------------------------------


def test_profile_can_be_updated(client, headers):
    res = client.patch(
        "/api/me", json={"full_name": "After", "preferred_style": "bachata"}, headers=headers
    )
    assert res.status_code == 200
    assert res.json()["full_name"] == "After"
    assert res.json()["preferred_style"] == "bachata"


def test_partial_profile_update_leaves_other_fields_alone(client, headers):
    client.patch("/api/me", json={"preferred_style": "kizomba"}, headers=headers)
    res = client.patch("/api/me", json={"full_name": "Renamed"}, headers=headers)
    assert res.json()["full_name"] == "Renamed"
    assert res.json()["preferred_style"] == "kizomba"


# --- password -----------------------------------------------------------


def test_password_change_requires_the_current_one(client, headers):
    res = client.post(
        "/api/me/password",
        json={"current_password": "not-it", "new_password": NEW_PASSWORD},
        headers=headers,
    )
    assert res.status_code == 403


def test_password_must_actually_change(client, headers):
    res = client.post(
        "/api/me/password",
        json={"current_password": PASSWORD, "new_password": PASSWORD},
        headers=headers,
    )
    assert res.status_code == 400


def test_password_change_takes_effect(client, headers):
    res = client.post(
        "/api/me/password",
        json={"current_password": PASSWORD, "new_password": NEW_PASSWORD},
        headers=headers,
    )
    assert res.status_code == 204

    assert client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD}).status_code == 401
    assert (
        client.post("/api/auth/login", json={"email": EMAIL, "password": NEW_PASSWORD}).status_code
        == 200
    )


def test_short_passwords_are_rejected(client, headers):
    res = client.post(
        "/api/me/password",
        json={"current_password": PASSWORD, "new_password": "short"},
        headers=headers,
    )
    assert res.status_code == 422
