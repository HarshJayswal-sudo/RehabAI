from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional


class ExerciseBase(BaseModel):
    code: Optional[str] = Field(None, max_length=50, description="Unique code e.g. leg_extension, squat")
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    body_part: Optional[str] = None
    difficulty: Optional[str] = None
    instructions: Optional[str] = None
    target_rom: Optional[float] = Field(None, ge=0, description="Target Range of Motion in degrees")
    active: bool = True


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    body_part: Optional[str] = None
    difficulty: Optional[str] = None
    instructions: Optional[str] = None
    target_rom: Optional[float] = Field(None, ge=0)
    active: Optional[bool] = None


class ExerciseResponse(ExerciseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
