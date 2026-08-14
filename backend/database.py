"""Schema helpers.

**Migrations are Alembic's job**, not this file's:

    alembic upgrade head                      apply pending migrations
    alembic revision --autogenerate -m "..."  write a new one from model changes
    alembic downgrade -1                      step back one

Railway runs `alembic upgrade head` as its pre-deploy command, so production
migrates itself on every deploy.

What remains here is a development convenience for throwing away a scratch
database. It must never be pointed at a database with real users: create_all
cannot alter a column or move data, which is exactly why Alembic exists.
"""
import sys

from sqlalchemy import text

from models import Base, get_engine

RLS_TABLES = (
    "users",
    "subscriptions",
    "courses",
    "modules",
    "lessons",
    "enrollments",
    "lesson_progress",
)


def apply_rls() -> None:
    """Mirror of the RLS step in the initial migration, for scratch databases."""
    with get_engine().begin() as conn:
        for table in RLS_TABLES:
            conn.execute(text(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY"))
    print(f"RLS enabled on {len(RLS_TABLES)} tables.")


def reset() -> None:
    engine = get_engine()
    Base.metadata.drop_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS alembic_version"))
    print("Dropped all tables. Now run: alembic upgrade head")


if __name__ == "__main__":
    if "--reset" in sys.argv:
        reset()
    else:
        raise SystemExit(
            "Use `alembic upgrade head` to build or migrate the schema.\n"
            "This script only offers --reset, which DESTROYS ALL DATA."
        )
