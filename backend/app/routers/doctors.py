from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models.user import User, UserRole
from app.models.authorization import DoctorPatientAuthorization, AuthorizationStatus
from app.models.session import RehabilitationSession
from app.schemas.user import UserResponse, UserPublic
from app.schemas.session import SessionResponse
from app.dependencies.auth import require_doctor, is_doctor_authorized

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("", response_model=List[UserPublic])
def list_doctors(db: Session = Depends(get_db)):
    """Public/patient-accessible directory of registered physiotherapists/doctors."""
    doctors = db.query(User).filter(User.role == UserRole.DOCTOR).all()
    return doctors


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(require_doctor)):
    return current_user


@router.get("/me/patients", response_model=List[UserPublic])
def get_my_patients(
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    """Return only patients who have approved authorization for this doctor."""
    auths = (
        db.query(DoctorPatientAuthorization)
        .options(joinedload(DoctorPatientAuthorization.patient))
        .filter(
            DoctorPatientAuthorization.doctor_id == current_user.id,
            DoctorPatientAuthorization.status == AuthorizationStatus.APPROVED,
        )
        .all()
    )
    return [auth.patient for auth in auths if auth.patient]


@router.get("/me/patients/{patient_id}/history", response_model=List[SessionResponse])
def get_patient_history(
    patient_id: int,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    if not is_doctor_authorized(db, current_user.id, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this patient's data",
        )

    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    sessions = (
        db.query(RehabilitationSession)
        .options(
            joinedload(RehabilitationSession.exercise),
            joinedload(RehabilitationSession.results),
        )
        .filter(RehabilitationSession.patient_id == patient_id)
        .order_by(RehabilitationSession.started_at.desc())
        .all()
    )
    return sessions


from app.routers.patients import compute_patient_progress


@router.get("/me/patients/{patient_id}/progress")
def get_patient_progress(
    patient_id: int,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    if not is_doctor_authorized(db, current_user.id, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this patient's data",
        )

    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    return compute_patient_progress(patient_id, db)
