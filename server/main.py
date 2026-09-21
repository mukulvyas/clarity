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

# CORS — allow the Next.js dev server and any configured origins
allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(compare.router, prefix="/api")
app.include_router(action_plan.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "clarity-api"}
