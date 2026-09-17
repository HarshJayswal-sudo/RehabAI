from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User, UserRole
from app.models.authorization import DoctorPatientAuthorization, AuthorizationStatus
from app.core.security import decode_access_token
from app.schemas.auth import TokenData

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        # DEVELOPMENT OVERRIDE: Mock a patient user
        dev_user = db.query(User).filter(User.email == "dev@local.host").first()
        if not dev_user:
            dev_user = User(
                name="Local Dev Patient",
                email="dev@local.host",
                hashed_password="mock",
                role=UserRole.PATIENT
            )
            db.add(dev_user)
            db.commit()
            db.refresh(dev_user)
        return dev_user

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        if payload is None:
            raise ValueError()
        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError()
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise ValueError()
        return user
    except Exception:
        # Fallback to dev user
        dev_user = db.query(User).filter(User.email == "dev@local.host").first()
        if not dev_user:
            dev_user = User(
                name="Local Dev Patient",
                email="dev@local.host",
                hashed_password="mock",
                role=UserRole.PATIENT
            )
            db.add(dev_user)
            db.commit()
            db.refresh(dev_user)
        return dev_user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


def require_patient(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient role required",
        )
    return current_user


def require_doctor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor role required",
        )
    return current_user


def is_doctor_authorized(db: Session, doctor_id: int, patient_id: int) -> bool:
    """Core authorization check used across the system."""
    auth = (
        db.query(DoctorPatientAuthorization)
        .filter(
            DoctorPatientAuthorization.doctor_id == doctor_id,
            DoctorPatientAuthorization.patient_id == patient_id,
            DoctorPatientAuthorization.status == AuthorizationStatus.APPROVED,
        )
        .first()
    )
    return auth is not None


def verify_doctor_patient_access(
    doctor: User,
    patient_id: int,
    db: Session = Depends(get_db),
) -> User:
    """Dependency: ensures the current doctor is authorized for the given patient."""
    if doctor.role != UserRole.DOCTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Doctor role required")

    if not is_doctor_authorized(db, doctor.id, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this patient's data",
        )
    return doctor
