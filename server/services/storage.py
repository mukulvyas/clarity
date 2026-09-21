"""
Storage service — uploads files to Supabase storage and returns the path.
"""
import io
import logging
from pathlib import Path

from server.db import get_supabase
from server.config import get_settings

logger = logging.getLogger(__name__)


def upload_to_storage(
    file_bytes: bytes,
    filename: str,
    document_id: str,
    content_type: str = "application/octet-stream",
) -> str:
    """
    Upload a file to Supabase storage under documents/{document_id}/{filename}.
    Returns the storage path.

    Raises RuntimeError on failure (caller converts to HTTPException).
    """
    settings = get_settings()
    supabase = get_supabase()

    storage_path = f"{document_id}/{filename}"

    try:
        supabase.storage.from_(settings.storage_bucket).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": content_type},
        )
        logger.info("Uploaded %s to storage bucket '%s'", storage_path, settings.storage_bucket)
        return storage_path
    except Exception as e:
        raise RuntimeError(f"Storage upload failed for '{filename}': {e}") from e


def get_signed_url(storage_path: str, expires_in: int = 3600) -> str:
    """Return a signed URL valid for `expires_in` seconds."""
    settings = get_settings()
    supabase = get_supabase()
    result = supabase.storage.from_(settings.storage_bucket).create_signed_url(
        storage_path, expires_in
    )
    return result["signedURL"]


def download_from_storage(storage_path: str) -> bytes:
    """Download a file from storage and return its bytes."""
    settings = get_settings()
    supabase = get_supabase()
    data = supabase.storage.from_(settings.storage_bucket).download(storage_path)
    return data
