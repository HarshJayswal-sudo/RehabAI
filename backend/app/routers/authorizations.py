from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models.user import User, UserRole
from app.models.authorization import DoctorPatientAuthorization, AuthorizationStatus
from app.schemas.authorization import (
    AuthorizationCreate,
    AuthorizationResponse,
    AuthorizationUpdateStatus,
)
from app.dependencies.auth import get_current_user, require_patient, require_doctor

router = APIRouter(prefix="/authorizations", tags=["Authorizations"])


@router.post("", response_model=AuthorizationResponse, status_code=status.HTTP_201_CREATED)
def create_authorization_request(
    payload: AuthorizationCreate,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    """Patient requests authorization with a doctor."""
    doctor = db.query(User).filter(User.id == payload.doctor_id, User.role == UserRole.DOCTOR).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    existing = (
        db.query(DoctorPatientAuthorization)
        .filter(
            DoctorPatientAuthorization.doctor_id == payload.doctor_id,
            DoctorPatientAuthorization.patient_id == current_user.id,
        )
        .first()
    )
    if existing:
        if existing.status == AuthorizationStatus.APPROVED:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already authorized")
        if existing.status == AuthorizationStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Request already pending")
        # If previously rejected/revoked, allow a new request by updating
        existing.status = AuthorizationStatus.PENDING
        db.commit()
        db.refresh(existing)
        return existing

    auth = DoctorPatientAuthorization(
        doctor_id=payload.doctor_id,
        patient_id=current_user.id,
        status=AuthorizationStatus.PENDING,
    )
    db.add(auth)
    db.commit()
    db.refresh(auth)
    return auth


@router.get("/me", response_model=List[AuthorizationResponse])
def list_my_authorizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List authorizations for the current user (as patient or doctor)."""
    if current_user.role == UserRole.PATIENT:
        auths = (
            db.query(DoctorPatientAuthorization)
            .options(
                joinedload(DoctorPatientAuthorization.doctor),
                joinedload(DoctorPatientAuthorization.patient),
            )
            .filter(DoctorPatientAuthorization.patient_id == current_user.id)
            .all()
        )
    else:
        auths = (
            db.query(DoctorPatientAuthorization)
            .options(
                joinedload(DoctorPatientAuthorization.doctor),
                joinedload(DoctorPatientAuthorization.patient),
            )
            .filter(DoctorPatientAuthorization.doctor_id == current_user.id)
            .all()
        )
    return auths


@router.patch("/{auth_id}/approve", response_model=AuthorizationResponse)
def approve_authorization(
    auth_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Doctor or Patient approves a pending authorization request."""
    auth = (
        db.query(DoctorPatientAuthorization)
        .options(
            joinedload(DoctorPatientAuthorization.doctor),
            joinedload(DoctorPatientAuthorization.patient),
        )
        .filter(DoctorPatientAuthorization.id == auth_id)
        .first()
    )
    if not auth:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Authorization not found")
    if auth.patient_id != current_user.id and auth.doctor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your authorization")
    if auth.status != AuthorizationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve authorization in status '{auth.status.value}'",
        )

    auth.status = AuthorizationStatus.APPROVED
    db.commit()
    db.refresh(auth)
    return auth


@router.patch("/{auth_id}/reject", response_model=AuthorizationResponse)
def reject_authorization(
    auth_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Doctor or Patient rejects a pending authorization request."""
    auth = (
        db.query(DoctorPatientAuthorization)
        .options(
            joinedload(DoctorPatientAuthorization.doctor),
            joinedload(DoctorPatientAuthorization.patient),
        )
        .filter(DoctorPatientAuthorization.id == auth_id)
        .first()
    )
    if not auth:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Authorization not found")
    if auth.patient_id != current_user.id and auth.doctor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your authorization")
    if auth.status != AuthorizationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject authorization in status '{auth.status.value}'",
        )

    auth.status = AuthorizationStatus.REJECTED
    db.commit()
    db.refresh(auth)
    return auth


@router.patch("/{auth_id}/revoke", response_model=AuthorizationResponse)
def revoke_authorization(
    auth_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Patient or doctor can revoke an approved authorization."""
    auth = (
        db.query(DoctorPatientAuthorization)
        .filter(DoctorPatientAuthorization.id == auth_id)
        .first()
    )
    if not auth:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Authorization not found")

    if current_user.role == UserRole.PATIENT and auth.patient_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your authorization")
    if current_user.role == UserRole.DOCTOR and auth.doctor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your authorization")

    if auth.status != AuthorizationStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only approved authorizations can be revoked",
        )

    auth.status = AuthorizationStatus.REVOKED
    db.commit()
    db.refresh(auth)
    return auth
