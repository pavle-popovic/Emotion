"""Runtime configuration, read from the environment.

Nothing here carries a production-usable default. A missing DATABASE_URL or
JWT_SECRET should fail loudly at boot rather than quietly run on a placeholder.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Postgres (Supabase). Use the pooled connection string on Railway.
    DATABASE_URL: str = ""

    # Auth
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = 60 * 24

    # Comma-separated list of allowed browser origins.
    CORS_ORIGINS: str = "http://localhost:3000"

    ENVIRONMENT: str = "development"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
