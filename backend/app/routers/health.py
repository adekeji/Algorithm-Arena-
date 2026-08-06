"""Health-check router."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Simple liveness probe for Cloud Run and monitoring."""
    return {"status": "ok", "service": "algorithm-arena-api"}
