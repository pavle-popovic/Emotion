"""Create all tables. Run with `python -m database` from backend/."""
from models import Base, get_engine


def init_db() -> None:
    Base.metadata.create_all(bind=get_engine())
    print("Database tables created successfully.")


if __name__ == "__main__":
    init_db()
