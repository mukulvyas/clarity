"""
Embeddings — text embedding and cosine similarity search via Supabase pgvector.

embed_text() uses Gemini text-embedding-004 (768 dimensions).
A startup assertion confirms the model still outputs 768 dims so the
vector(768) Postgres column never silently mismatches.
"""
import logging
from typing import Optional

import google.generativeai as genai

from server.config import get_settings

logger = logging.getLogger(__name__)

# Expected dimension — must match the vector(768) column in Supabase
_EXPECTED_DIM = 768


def _configure_gemini() -> None:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)


def embed_text(text: str) -> list[float]:
    """
    Embed text using Gemini text-embedding-004 (768-dim output).
    Raises ValueError if the returned vector dimension doesn't match
    _EXPECTED_DIM — catching dimension drift at call time, not silently
    storing wrong-shaped vectors.
    """
    settings = get_settings()
    _configure_gemini()
    result = genai.embed_content(
        model=settings.embedding_model,
        content=text,
        task_type="RETRIEVAL_DOCUMENT",
        output_dimensionality=_EXPECTED_DIM,
    )
    embedding: list[float] = result["embedding"]
    if len(embedding) != _EXPECTED_DIM:
        raise ValueError(
            f"Embedding dimension mismatch: expected {_EXPECTED_DIM}, "
            f"got {len(embedding)} from model '{settings.embedding_model}'. "
            "Update the vector(N) column in Supabase and _EXPECTED_DIM here."
        )
    return embedding


def assert_embedding_dim() -> None:
    """
    Call once at server startup (in main.py lifespan) to fail fast if
    the embedding model output dimension doesn't match the DB column.
    Uses a short test string to avoid unnecessary API cost.
    """
    settings = get_settings()
    if not settings.gemini_api_key:
        logger.warning(
            "GEMINI_API_KEY not set — skipping embedding dimension assertion. "
            "Embeddings will fail at runtime."
        )
        return
    try:
        test_embedding = embed_text("Clarity dimension check")
        assert len(test_embedding) == _EXPECTED_DIM, (
            f"Startup assertion failed: expected {_EXPECTED_DIM} dims, "
            f"got {len(test_embedding)}"
        )
        logger.info(
            "Embedding dimension assertion passed: %d dims ✓", _EXPECTED_DIM
        )
    except Exception as e:
        raise RuntimeError(f"Embedding startup assertion failed: {e}") from e


def cosine_search(
    document_id: str,
    embedding: list[float],
    top_k: int = 5,
    exclude_clause_id: Optional[str] = None,
) -> list[dict]:
    """
    Vector similarity search within a document's clause chunks.
    Calls the Supabase RPC function `match_clauses` which runs
    cosine similarity against the pgvector index.

    Returns up to top_k clause dicts ordered by similarity.
    """
    from server.db import get_supabase
    supabase = get_supabase()

    params: dict = {
        "query_embedding": embedding,
        "match_document_id": document_id,
        "match_count": top_k,
    }
    if exclude_clause_id:
        params["exclude_clause_id"] = exclude_clause_id

    result = supabase.rpc("match_clauses", params).execute()
    if result.data is None:
        return []
    return result.data
