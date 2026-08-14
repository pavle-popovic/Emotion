"""Password hashing and JWT issuing/verification."""
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from config import settings
from models import User, get_db

_bearer = HTTPBearer(auto_error=False)

# bcrypt hashes at most 72 bytes and raises on anything longer. Truncate here so
# a long passphrase is accepted rather than 500ing, and do it in both directions
# so hash and verify always see the same bytes. Deliberately not passlib: that
# project last shipped in 2020 and breaks against bcrypt 4.1+.
_MAX_BCRYPT_BYTES = 72


def _to_bytes(raw: str) -> bytes:
    return raw.encode("utf-8")[:_MAX_BCRYPT_BYTES]


def hash_password(raw: str) -> str:
    return bcrypt.hashpw(_to_bytes(raw), bcrypt.gensalt()).decode("utf-8")


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_to_bytes(raw), hashed.encode("utf-8"))
    except ValueError:
        # Malformed or truncated hash in the row: treat as a failed login.
        return False


def _secret() -> str:
    if not settings.JWT_SECRET:
        raise RuntimeError("JWT_SECRET is not set.")
    return settings.JWT_SECRET


def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(payload, _secret(), algorithm=settings.JWT_ALGORITHM)


def _user_from_credentials(
    creds: Optional[HTTPAuthorizationCredentials], db: Session
) -> Optional[User]:
    if creds is None:
        return None
    try:
        payload = jwt.decode(creds.credentials, _secret(), algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        return None
    return user


def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    user = _user_from_credentials(creds, db)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    return user


def get_current_user_optional(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """For endpoints that render for signed-out visitors but personalise when signed in.

    A bad or expired token resolves to None rather than 401, so a stale cookie
    shows the logged-out catalog instead of erroring the whole page.
    """
    return _user_from_credentials(creds, db)


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admins only")
    return user
