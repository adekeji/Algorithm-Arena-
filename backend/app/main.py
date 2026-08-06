"""Algorithm Arena — FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, challenges

settings = get_settings()

app = FastAPI(
    title="Algorithm Arena API",
    description="Backend API for the Algorithm Arena platform — execute code, get AI feedback, manage challenges.",
    version="0.1.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(challenges.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "Algorithm Arena API",
        "version": "0.1.0",
        "docs": "/docs",
    }
