"""
FastAPI application entry point.

Lifespan:
  - Validates required env vars at startup
  - Runs embedding dimension assertion (confirms model output matches DB column)
  - Initializes Supabase client

CORS:
  Configured for local development (localhost:3000). Set
  ALLOWED_ORIGINS env var in production.
"""
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load .env file for local development (no-op in production where real env vars are set)
load_dotenv("server/.env")

from server.config import get_settings
from server.db import init_supabase
from server.routers import documents, chat, compare, action_plan

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup validations — fail fast before accepting any traffic."""
    settings = get_settings()

    # Validate and connect to external services only in non-test environments
    if settings.environment != "test":
        # 1. Validate critical env vars
        settings.validate()

        # 2. Initialize Supabase connection
        init_supabase()
        logger.info("Supabase client initialized.")

        # 3. Assert embedding model dimension matches vector(768) column
        from server.embeddings import assert_embedding_dim
        assert_embedding_dim()

    logger.info("Clarity backend ready. Environment: %s", settings.environment)
    yield
    logger.info("Clarity backend shutting down.")


app = FastAPI(
    title="Clarity API",
    description="GenAI-powered legal document assistant backend.",
    version="1.0.0",
    lifespan=lifespan,
    # In production, disable the docs if you want:
    # docs_url=None if not settings.is_dev else "/docs",
)

# CORS — allow the Next.js dev server, production Vercel app, and any configured origins
raw_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://clarity-dusky-eight.vercel.app",
)
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

import time
from collections import defaultdict
from fastapi.responses import JSONResponse

# In-memory sliding window rate limiter (120 req/min per IP)
_request_counts = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 120
RATE_LIMIT_WINDOW_SECONDS = 60

from fastapi import Request
@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # 1. Rate limiting check (bypassed for health check)
    if not request.url.path.startswith("/health"):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - RATE_LIMIT_WINDOW_SECONDS
        _request_counts[client_ip] = [t for t in _request_counts[client_ip] if t > window_start]
        if len(_request_counts[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Rate limit exceeded."},
                headers={"Retry-After": "60", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY"}
            )
        _request_counts[client_ip].append(now)

    # 2. Process request & attach security defense headers
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Register routers
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(compare.router, prefix="/api")
app.include_router(action_plan.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "clarity-api"}
