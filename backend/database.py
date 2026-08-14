"""Schema management.

    python -m database          create any missing tables
    python -m database --reset  drop everything and rebuild (destroys all data)

Both re-apply RLS afterwards. That matters: these tables live in Supabase's
`public` schema, which PostgREST exposes to the anon key. RLS with zero policies
denies anon and authenticated outright, while the backend connects as `postgres`
and bypasses it. Creating a table without doing this would publish
`users.hashed_password` to anyone holding the (public by design) anon key.

This is deliberately not a migration tool. Before real users exist, swap it for
Alembic - `create_all` cannot alter a column or move data.
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
    with get_engine().begin() as conn:
        for table in RLS_TABLES:
            conn.execute(text(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY"))
    print(f"RLS enabled on {len(RLS_TABLES)} tables.")


def init_db(reset: bool = False) -> None:
    engine = get_engine()
    if reset:
        Base.metadata.drop_all(bind=engine)
        print("Dropped all tables.")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")
    apply_rls()


if __name__ == "__main__":
    init_db(reset="--reset" in sys.argv)
