from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from app.models.session import SessionStatus
from app.schemas.exercise import ExerciseResponse
from app.schemas.result import ExerciseResultResponse


class SessionCreate(BaseModel):
    exercise_id: Optional[int] = Field(None, gt=0, description="ID of exercise")
    exercise_code: Optional[str] = Field(None, description="Code of exercise e.g. leg_extension, squat")


class SessionComplete(BaseModel):
    # Optional: client can send duration, otherwise backend calculates
    duration_seconds: Optional[float] = Field(None, ge=0)


class SessionResponse(BaseModel):
    id: int
    patient_id: int
    exercise_id: int
    status: SessionStatus
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    created_at: datetime
    exercise: Optional[ExerciseResponse] = None
    results: Optional[ExerciseResultResponse] = None

    model_config = ConfigDict(from_attributes=True)
