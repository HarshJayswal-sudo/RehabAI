from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from app.models.authorization import AuthorizationStatus
from app.schemas.user import UserPublic


class AuthorizationCreate(BaseModel):
    """Patient requests authorization with a doctor."""
    doctor_id: int = Field(..., gt=0)


class AuthorizationResponse(BaseModel):
    id: int
    doctor_id: int
    patient_id: int
    status: AuthorizationStatus
    created_at: datetime
    updated_at: datetime
    doctor: Optional[UserPublic] = None
    patient: Optional[UserPublic] = None

    model_config = ConfigDict(from_attributes=True)


class AuthorizationUpdateStatus(BaseModel):
    status: AuthorizationStatus
