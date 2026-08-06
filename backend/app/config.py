"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Central config — all values sourced from .env or environment."""

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # Google Gemini
    gemini_api_key: str = ""

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # CORS — the frontend origin
    frontend_url: str = "http://localhost:3000"

    # Execution sandbox
    execution_timeout_seconds: int = 3

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
