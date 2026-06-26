"""SentinelX AI — FastAPI application entrypoint.

Implements the PRD API design (section 9) plus the supporting platform
endpoints required by the user-flow blueprint (dashboard, threat feed, alerts,
API keys, usage analytics).
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import core, platform

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="The AI Immune System for Web3 — wallet, transaction & contract threat intelligence API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(core.router)
app.include_router(platform.router)


@app.get("/", tags=["meta"])
def root() -> dict:
    return {"name": settings.app_name, "version": settings.app_version, "status": "operational"}


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {
        "status": "healthy",
        "environment": settings.environment,
        "live_providers": settings.live_providers_enabled,
    }
