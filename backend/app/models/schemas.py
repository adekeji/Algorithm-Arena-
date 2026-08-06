"""Pydantic schemas for request / response models."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── Users ────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: UUID
    email: str
    role: str = "developer"
    stripe_customer_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Challenges ───────────────────────────────────────────────────────────

class ChallengeOut(BaseModel):
    id: UUID
    title: str
    description: str
    starter_code: str = ""
    test_cases: Any = Field(default_factory=list)
    difficulty: str = "medium"
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Submissions ──────────────────────────────────────────────────────────

class SubmissionCreate(BaseModel):
    """Payload sent by the frontend to execute code."""
    challenge_id: UUID
    code: str
    language: str = "python"


class SubmissionOut(BaseModel):
    id: UUID
    user_id: UUID
    challenge_id: UUID
    code: str
    language: str
    status: str
    execution_time_ms: Optional[int] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    ai_feedback: Optional[Any] = None
    created_at: datetime

    model_config = {"from_attributes": True}
