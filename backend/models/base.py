from typing import Generator, Optional

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from config import settings


class Base(DeclarativeBase):
    pass


_engine: Optional[Engine] = None
_SessionLocal: Optional[sessionmaker] = None


def _normalize(url: str) -> str:
    # Supabase hands out postgres:// ; SQLAlchemy 2 wants postgresql://
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        if not settings.DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL is not set. Add it to backend/.env locally, or to "
                "the Railway service variables in production."
            )
        _engine = create_engine(
            _normalize(settings.DATABASE_URL),
            pool_pre_ping=True,
            pool_recycle=300,
        )
    return _engine


def get_session_local() -> sessionmaker:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), autoflush=False, autocommit=False)
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()
