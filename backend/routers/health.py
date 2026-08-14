from fastapi import APIRouter
from sqlalchemy import text

from config import settings
from models import get_engine

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    """Liveness. Never touches the database, so it answers before Supabase is wired."""
    return {"status": "ok", "service": "emotion-api", "environment": settings.ENVIRONMENT}


@router.get("/health/db")
def health_db():
    """Readiness. Reports the database state without taking the process down."""
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        return {"status": "degraded", "database": "unavailable", "detail": str(exc)[:200]}
