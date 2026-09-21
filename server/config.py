"""
Configuration — reads all env vars from the environment.
Never hardcode secrets here. Use .env locally (loaded via python-dotenv
in main.py) and real env vars in production.
"""
import os
from pathlib import Path
from functools import lru_cache
from dotenv import load_dotenv

# Search and load .env from current directory or server directory
env_paths = [
    Path("server/.env"),
    Path(".env"),
    Path(__file__).parent / ".env",
    Path(__file__).parent.parent / ".env",
    Path(__file__).parent.parent / "server" / ".env",
]
for p in env_paths:
    if p.exists():
        load_dotenv(p, override=False)



class Settings:
    # Supabase
    supabase_url: str = os.environ.get("SUPABASE_URL", "")
    supabase_service_role_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    database_url: str = os.environ.get("DATABASE_URL", "")

    # LLM providers
    gemini_api_key: str = os.environ.get("GEMINI_API_KEY", "")
    anthropic_api_key: str = os.environ.get("ANTHROPIC_API_KEY", "")

    # OCR / Document AI
    google_doc_ai_project_id: str = os.environ.get("GOOGLE_DOCUMENT_AI_PROJECT_ID", "")
    google_doc_ai_processor_id: str = os.environ.get("GOOGLE_DOCUMENT_AI_PROCESSOR_ID", "")
    google_application_credentials: str = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "")

    # App config
    environment: str = os.environ.get("ENVIRONMENT", "development")
    max_upload_size_mb: int = int(os.environ.get("MAX_UPLOAD_SIZE_MB", "50"))
    ocr_confidence_threshold: float = float(os.environ.get("OCR_CONFIDENCE_THRESHOLD", "60"))

    # Storage bucket name in Supabase
    storage_bucket: str = "documents"

    # Embedding model (Gemini gemini-embedding-2 -> truncated to 768 dims)
    embedding_model: str = "models/gemini-embedding-2"
    embedding_dim: int = 768  # Must match vector(768) column in Postgres

    @property
    def is_dev(self) -> bool:
        return self.environment == "development"

    def validate(self) -> None:
        """Raise at startup if critical vars are missing."""
        missing = []
        if not self.supabase_url:
            missing.append("SUPABASE_URL")
        if not self.supabase_service_role_key:
            missing.append("SUPABASE_SERVICE_ROLE_KEY")
        if not self.gemini_api_key:
            missing.append("GEMINI_API_KEY")
        if missing:
            raise RuntimeError(
                f"Missing required environment variables: {', '.join(missing)}. "
                "Copy env.example to .env and fill in your keys."
            )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
