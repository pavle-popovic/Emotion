"""Create or promote an admin account.

    python -m scripts.create_admin <email> <password>

Idempotent: an existing account is promoted to ADMIN and its password reset to
the one given, rather than erroring.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import User, UserRole, get_engine
from security import hash_password


def upsert_admin(session: Session, email: str, password: str, full_name: str = "Admin") -> User:
    email = email.lower().strip()
    user = session.scalar(select(User).where(User.email == email))

    if user is None:
        user = User(email=email, full_name=full_name, hashed_password=hash_password(password))
        session.add(user)
        action = "created"
    else:
        user.hashed_password = hash_password(password)
        action = "updated"

    user.role = UserRole.ADMIN
    user.is_active = True
    session.commit()
    session.refresh(user)
    print(f"{action} admin: {user.email} (id={user.id}, role={user.role.value})")
    return user


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit("usage: python -m scripts.create_admin <email> <password>")

    with Session(get_engine()) as session:
        upsert_admin(session, sys.argv[1], sys.argv[2])
