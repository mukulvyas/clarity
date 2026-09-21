"""
LLM Client — Gemini API wrapper with retry/backoff.

Design:
- Single async generate() interface so swapping providers (Gemini → Claude)
  never touches business logic in services/
- Retry with exponential backoff on transient errors (rate limit, service
  unavailable) only — auth errors and bad requests surface immediately
- In development: full error details raised as HTTPException(500)
- In production: logs error, re-raises (caller decides how to handle)
"""
import logging
from typing import Optional

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable, InvalidArgument
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)
from fastapi import HTTPException

from server.config import get_settings

logger = logging.getLogger(__name__)


def _configure_gemini() -> None:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    genai.configure(api_key=settings.gemini_api_key)


# Retry only on transient errors. InvalidArgument (bad prompt) and
# PermissionDenied (bad key) should surface immediately.
_RETRYABLE = (ResourceExhausted, ServiceUnavailable)


@retry(
    retry=retry_if_exception_type(_RETRYABLE),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=8),
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True,
)
async def _call_gemini(
    prompt: str,
    system_prompt: Optional[str],
    model_name: str,
    temperature: float,
) -> str:
    """Low-level Gemini call with retry. Raises on failure after retries."""
    _configure_gemini()
    generation_config = genai.types.GenerationConfig(temperature=temperature)
    
    # Try primary model, fallback to active Gemini 3.x models
    candidate_models = [model_name, "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"]
    # De-duplicate preserving order
    seen = set()
    models_to_try = [m for m in candidate_models if not (m in seen or seen.add(m))]

    last_exc = None
    for target_model in models_to_try:
        try:
            model_kwargs = {
                "model_name": target_model,
                "generation_config": generation_config,
            }
            if system_prompt and system_prompt.strip():
                model_kwargs["system_instruction"] = system_prompt.strip()

            model = genai.GenerativeModel(**model_kwargs)
            response = await model.generate_content_async(prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            last_exc = e
            logger.warning(f"Model {target_model} failed, trying next candidate: {e}")
            continue

    if last_exc:
        raise last_exc
    raise RuntimeError("All Gemini candidate models failed to produce a response.")


async def generate(
    prompt: str,
    system_prompt: Optional[str] = None,
    model_name: str = "gemini-3.6-flash",
    temperature: float = 0.2,
) -> str:
    """
    Generate text via Gemini. Raises HTTPException(500) in development
    with full error details. In production, re-raises for the caller to handle.

    Never returns empty string silently — callers should not need to
    null-check the return value; exceptions are the error contract.
    """
    settings = get_settings()
    try:
        result = await _call_gemini(prompt, system_prompt, model_name, temperature)
        if not result or not result.strip():
            raise ValueError("Gemini returned an empty response.")
        return result
    except InvalidArgument as e:
        # Bad prompt / config — surface immediately, no retry
        _raise_llm_error(f"Invalid Gemini request: {e}", settings.is_dev)
    except _RETRYABLE as e:
        # Still failing after retries
        _raise_llm_error(f"Gemini rate-limit or service error after retries: {e}", settings.is_dev)
    except Exception as e:
        _raise_llm_error(f"Gemini call failed: {e}", settings.is_dev)


def _raise_llm_error(message: str, is_dev: bool) -> None:
    """In dev: raise HTTPException(500) with full message so it's visible in
    the FastAPI docs/response. In prod: raise RuntimeError for structured
    logging at the router/service level."""
    logger.error(message)
    if is_dev:
        raise HTTPException(status_code=500, detail=f"[LLM ERROR - dev] {message}")
    raise RuntimeError(message)
