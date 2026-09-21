"""
Supabase client — uses service-role key for backend operations.
The service-role key bypasses RLS so the backend can read/write any row.
Frontend uses the anon key (set in NEXT_PUBLIC_SUPABASE_ANON_KEY) which
respects RLS policies.
"""
from functools import lru_cache

from supabase import create_client, Client

from server.config import get_settings


@lru_cache()
def get_supabase() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. "
            "Copy env.example to .env and fill in your credentials."
        )
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


# Convenience alias used throughout the codebase
supabase: Client = None  # Initialized lazily on first import that calls get_supabase()


def init_supabase() -> Client:
    """Call once at app startup (in main.py lifespan) to validate connection."""
    global supabase
    supabase = get_supabase()
    return supabase
