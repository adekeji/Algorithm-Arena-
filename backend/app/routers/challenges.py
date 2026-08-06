"""Challenges router — list and retrieve challenges."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.database import get_supabase_client
from app.models.schemas import ChallengeOut

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.get("/", response_model=List[ChallengeOut])
async def list_challenges():
    """Return all available challenges, ordered by creation date."""
    supabase = get_supabase_client()
    result = supabase.table("challenges").select("*").order("created_at").execute()
    return result.data


@router.get("/{challenge_id}", response_model=ChallengeOut)
async def get_challenge(challenge_id: UUID):
    """Return a single challenge by ID."""
    supabase = get_supabase_client()
    result = (
        supabase.table("challenges")
        .select("*")
        .eq("id", str(challenge_id))
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return result.data
