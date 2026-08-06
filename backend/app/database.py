"""Supabase client initialisation for the backend."""

from supabase import create_client, Client
from app.config import get_settings


def get_supabase_client() -> Client:
    """Create and return a Supabase client using the service-role key.

    The service-role key bypasses Row-Level Security, so it must only be
    used server-side for privileged operations (e.g., reading hidden test
    cases, writing submissions on behalf of authenticated users).
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
