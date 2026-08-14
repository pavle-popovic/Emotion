"""Auth round trip against the configured DATABASE_URL.

Run from backend/ with `python -m pytest`. These hit a real Postgres because the
bug that motivated them (passlib 1.7.4 against bcrypt 5.x) only showed up with
the real hashing backend installed, not against a stub.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from main import app
from models import get_engine
from security import hash_password, verify_password

EMAIL = "pytest-auth@example.com"
PASSWORD = "correct-horse-battery-staple"


@pytest.fixture()
def client():
    with get_engine().begin() as conn:
        conn.execute(text("delete from users where email = :e"), {"e": EMAIL})
    yield TestClient(app)
    with get_engine().begin() as conn:
        conn.execute(text("delete from users where email = :e"), {"e": EMAIL})


def test_hash_round_trip():
    hashed = hash_password(PASSWORD)
    assert verify_password(PASSWORD, hashed)
    assert not verify_password("wrong", hashed)


def test_password_longer_than_bcrypt_limit():
    """bcrypt rejects >72 bytes outright; we truncate so this must not raise."""
    long_password = "x" * 200
    assert verify_password(long_password, hash_password(long_password))


def test_verify_rejects_malformed_hash():
    assert not verify_password(PASSWORD, "not-a-bcrypt-hash")


def test_register_login_me(client):
    res = client.post(
        "/api/auth/register",
        json={"email": EMAIL, "password": PASSWORD, "full_name": "Pytest"},
    )
    assert res.status_code == 201, res.text
    token = res.json()["access_token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == EMAIL
    assert res.json()["role"] == "student"

    assert client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD}).status_code == 200
    assert client.post("/api/auth/login", json={"email": EMAIL, "password": "nope"}).status_code == 401


def test_duplicate_email_conflicts(client):
    first = client.post("/api/auth/register", json={"email": EMAIL, "password": PASSWORD})
    assert first.status_code == 201
    second = client.post("/api/auth/register", json={"email": EMAIL, "password": PASSWORD})
    assert second.status_code == 409


def test_me_requires_a_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_courses_catalog_is_public(client):
    res = client.get("/api/courses")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
