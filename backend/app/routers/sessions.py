from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import re

from app.database import get_db
from app.models.user import User, UserRole
from app.models.exercise import Exercise
from app.models.session import RehabilitationSession, SessionStatus
from app.models.result import ExerciseResult
from app.schemas.session import SessionCreate, SessionResponse, SessionComplete
from app.schemas.result import ExerciseResultCreate, ExerciseResultResponse
from app.dependencies.auth import (
    get_current_user,
    require_patient,
    require_doctor,
    is_doctor_authorized,
)
from app.core.security import create_access_token
from datetime import timedelta

router = APIRouter(prefix="/sessions", tags=["Rehabilitation Sessions"])


# Known exercise code aliases for resilient matching
EXERCISE_ALIASES = {
    "wall push up": "wall_pushup",
    "wall_push_up": "wall_pushup",
    "wall-pushup": "wall_pushup",
    "wall pushup": "wall_pushup",
    "wallpushup": "wall_pushup",
    "wind will toe touch": "windwheel_toe_touch",
    "wind wheel toe touch": "windwheel_toe_touch",
    "windwheel_toe_touch": "windwheel_toe_touch",
    "windwheel toetouch": "windwheel_toe_touch",
    "leg extension": "leg_extension",
    "leg_extension": "leg_extension",
    "knee extension": "leg_extension",
    "knee_extension": "leg_extension",
    "squat": "squat",
    "squats": "squat",
    "shoulder raise": "shoulder_raise",
    "shoulder_raise": "shoulder_raise",
    "arm circles": "arm_circles",
    "arm_circles": "arm_circles",
}


def normalize_exercise_code(raw_code: str) -> str:
    """Clean and normalize exercise names and codes to canonical identifier."""
    if not raw_code:
        return "unknown_exercise"
    cleaned = raw_code.strip().lower()
    # Check direct aliases
    if cleaned in EXERCISE_ALIASES:
        return EXERCISE_ALIASES[cleaned]
    # Replace non-alphanumeric with underscores
    slug = re.sub(r"[^\w\s-]", "", cleaned)
    slug = re.sub(r"[\s-]+", "_", slug).strip("_")
    return EXERCISE_ALIASES.get(slug, slug)


def get_or_create_exercise(db: Session, code_or_name: Optional[str] = None, exercise_id: Optional[int] = None) -> Exercise:
    """
    Optimistically retrieves or auto-provisions an exercise in the database.
    Guarantees AI result ingestion never fails due to unknown or unseeded exercises.
    """
    if exercise_id:
        ex = db.query(Exercise).filter(Exercise.id == exercise_id).first()
        if ex:
            return ex

    if not code_or_name:
        code_or_name = "general_rehab"

    canonical_code = normalize_exercise_code(code_or_name)

    # Try lookup by exact code or name
    ex = (
        db.query(Exercise)
        .filter(
            (Exercise.code == canonical_code)
            | (Exercise.name.ilike(code_or_name.strip()))
            | (Exercise.code == code_or_name.strip())
        )
        .first()
    )
    if ex:
        return ex

    # Auto-provision exercise optimistically
    display_name = canonical_code.replace("_", " ").title()
    body_part = "general"
    target_rom = 90.0

    if "leg" in canonical_code or "knee" in canonical_code or "squat" in canonical_code:
        body_part = "leg"
    elif "pushup" in canonical_code or "chest" in canonical_code:
        body_part = "chest"
    elif "shoulder" in canonical_code or "arm" in canonical_code:
        body_part = "shoulder"
    elif "toe_touch" in canonical_code or "spine" in canonical_code or "windwheel" in canonical_code:
        body_part = "spine"
        target_rom = 170.0

    new_exercise = Exercise(
        code=canonical_code,
        name=display_name,
        description=f"AI-assisted rehabilitation exercise for {display_name}.",
        body_part=body_part,
        difficulty="beginner",
        instructions=f"Perform {display_name} with steady control according to AI posture cues.",
        target_rom=target_rom,
        active=True,
    )
    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)
    return new_exercise


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(
    payload: SessionCreate,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    exercise = get_or_create_exercise(db, code_or_name=payload.exercise_code, exercise_id=payload.exercise_id)

    # Optional: prevent multiple concurrent active sessions
    active = (
        db.query(RehabilitationSession)
        .filter(
            RehabilitationSession.patient_id == current_user.id,
            RehabilitationSession.status == SessionStatus.ACTIVE,
        )
        .first()
    )
    if active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You already have an active session (id={active.id}). Complete or cancel it first.",
        )

    session = RehabilitationSession(
        patient_id=current_user.id,
        exercise_id=exercise.id,
        status=SessionStatus.ACTIVE,
        started_at=datetime.utcnow(),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Reload with relationships
    session = (
        db.query(RehabilitationSession)
        .options(joinedload(RehabilitationSession.exercise))
        .filter(RehabilitationSession.id == session.id)
        .first()
    )
    return session


@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(RehabilitationSession)
        .options(
            joinedload(RehabilitationSession.exercise),
            joinedload(RehabilitationSession.results),
        )
        .filter(RehabilitationSession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # Ownership / authorization check
    if current_user.role == UserRole.PATIENT:
        if session.patient_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your session")
    elif current_user.role == UserRole.DOCTOR:
        if not is_doctor_authorized(db, current_user.id, session.patient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this session",
            )
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return session


@router.patch("/{session_id}/complete", response_model=SessionResponse)
def complete_session(
    session_id: int,
    payload: Optional[SessionComplete] = None,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    session = db.query(RehabilitationSession).filter(RehabilitationSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.patient_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your session")
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Session is already {session.status.value}",
        )

    now = datetime.utcnow()
    session.status = SessionStatus.COMPLETED
    session.ended_at = now

    if payload and payload.duration_seconds is not None:
        session.duration_seconds = payload.duration_seconds
    else:
        delta = now - session.started_at
        session.duration_seconds = delta.total_seconds()

    db.commit()
    db.refresh(session)

    session = (
        db.query(RehabilitationSession)
        .options(
            joinedload(RehabilitationSession.exercise),
            joinedload(RehabilitationSession.results),
        )
        .filter(RehabilitationSession.id == session_id)
        .first()
    )
    return session


@router.post("/{session_id}/results", response_model=ExerciseResultResponse, status_code=status.HTTP_201_CREATED)
def submit_ai_result(
    session_id: int,
    payload: ExerciseResultCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Receive and persist AI/CV evaluation results for a session."""
    session = (
        db.query(RehabilitationSession)
        .options(joinedload(RehabilitationSession.exercise))
        .filter(RehabilitationSession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if current_user.role == UserRole.PATIENT and session.patient_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your session")
    if current_user.role == UserRole.DOCTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Doctors cannot submit AI results")

    existing = db.query(ExerciseResult).filter(ExerciseResult.session_id == session_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Results already submitted for this session",
        )

    rep_details = None
    if payload.repetitions_detail:
        rep_details = [
            r.model_dump() if hasattr(r, "model_dump") else r
            for r in payload.repetitions_detail
        ]

    result = ExerciseResult(
        session_id=session_id,
        video_filename=payload.video_filename,
        repetitions=payload.repetitions,
        correct_repetitions=payload.correct_repetitions,
        incorrect_repetitions=payload.incorrect_repetitions,
        score=payload.score,
        average_rom=payload.average_rom,
        feedback=payload.feedback,
        errors=payload.errors,
        repetitions_detail=rep_details,
        ai_result=payload.ai_result,
    )
    db.add(result)

    if session.status == SessionStatus.ACTIVE:
        now = datetime.utcnow()
        session.status = SessionStatus.COMPLETED
        session.ended_at = now
        if not session.duration_seconds:
            session.duration_seconds = max(0.0, (now - session.started_at).total_seconds())

    db.commit()
    db.refresh(result)
    return result


@router.post("/{session_id}/ai-result", response_model=ExerciseResultResponse, status_code=status.HTTP_201_CREATED)
def submit_direct_ai_payload(
    session_id: int,
    raw_payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Direct endpoint accepting raw AI JSON payloads."""
    data = raw_payload
    video_name = None

    # Handle video-keyed single entry payload
    if len(raw_payload) == 1 and not any(k in raw_payload for k in ("exercise", "repetitions", "average_score", "repetitions_detail")):
        video_key, inner_data = next(iter(raw_payload.items()))
        if isinstance(inner_data, dict):
            data = inner_data.copy()
            video_name = str(video_key).strip()

    if video_name and not data.get("video_filename"):
        data["video_filename"] = video_name

    parsed = ExerciseResultCreate.model_validate(data)
    return submit_ai_result(session_id=session_id, payload=parsed, current_user=current_user, db=db)


def _record_single_ai_entry(patient_id: int, data: dict, video_filename: Optional[str], db: Session) -> RehabilitationSession:
    """Helper to record a single completed session and AI result."""
    exercise_code = data.get("exercise")
    exercise_id = data.get("exercise_id")

    exercise = get_or_create_exercise(db, code_or_name=exercise_code, exercise_id=exercise_id)

    now = datetime.utcnow()
    session = RehabilitationSession(
        patient_id=patient_id,
        exercise_id=exercise.id,
        status=SessionStatus.COMPLETED,
        started_at=now,
        ended_at=now,
        duration_seconds=data.get("duration_seconds", 30.0),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    if video_filename and not data.get("video_filename"):
        data["video_filename"] = video_filename

    parsed_result = ExerciseResultCreate.model_validate(data)
    rep_details = None
    if parsed_result.repetitions_detail:
        rep_details = [
            r.model_dump() if hasattr(r, "model_dump") else r
            for r in parsed_result.repetitions_detail
        ]

    result = ExerciseResult(
        session_id=session.id,
        video_filename=parsed_result.video_filename or video_filename,
        repetitions=parsed_result.repetitions,
        correct_repetitions=parsed_result.correct_repetitions,
        incorrect_repetitions=parsed_result.incorrect_repetitions,
        score=parsed_result.score,
        average_rom=parsed_result.average_rom,
        feedback=parsed_result.feedback,
        errors=parsed_result.errors,
        repetitions_detail=rep_details,
        ai_result=parsed_result.ai_result,
    )
    db.add(result)
    db.commit()

    return (
        db.query(RehabilitationSession)
        .options(
            joinedload(RehabilitationSession.exercise),
            joinedload(RehabilitationSession.results),
        )
        .filter(RehabilitationSession.id == session.id)
        .first()
    )


@router.post("/quick-record", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def quick_record_session(
    payload: dict,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    """
    Optimistic single-step recording endpoint.
    Supports single exercise dicts or single-video dicts.
    """
    data = payload
    video_name = None

    if len(payload) == 1 and not any(k in payload for k in ("exercise", "repetitions", "average_score", "repetitions_detail")):
        video_key, inner_data = next(iter(payload.items()))
        if isinstance(inner_data, dict):
            data = inner_data
            video_name = str(video_key).strip()

    return _record_single_ai_entry(patient_id=current_user.id, data=data, video_filename=video_name, db=db)


@router.post("/batch-record")
def batch_record_sessions(
    payload: dict,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    """
    Ingests an entire multi-video evaluation file containing multiple video runs in one request.
    Example:
    {
      "8026939-uhd_2160_4096_25fps.mp4": { "exercise": "squat", ... },
      "4158861-hd_1080_1920_24fps.mp4": { "exercise": "squat", ... },
      "wall push up 2.mp4": { "exercise": "wall_pushup", ... }
    }
    """
    sessions_created = []
    scores = []
    roms = []

    for video_key, video_data in payload.items():
        if isinstance(video_data, dict):
            video_filename = str(video_key).strip()
            session = _record_single_ai_entry(
                patient_id=current_user.id,
                data=video_data,
                video_filename=video_filename,
                db=db,
            )
            if session.results:
                if session.results.score is not None:
                    scores.append(session.results.score)
                if session.results.average_rom is not None:
                    roms.append(session.results.average_rom)

            sessions_created.append(SessionResponse.model_validate(session))

    avg_score = round(sum(scores) / len(scores), 2) if scores else None
    avg_rom = round(sum(roms) / len(roms), 2) if roms else None

    return {
        "message": f"Successfully processed {len(sessions_created)} exercise video evaluations",
        "total_processed": len(sessions_created),
        "batch_average_score": avg_score,
        "batch_average_rom": avg_rom,
        "sessions": sessions_created,
    }


@router.post("/{session_id}/doctor-access")
def request_doctor_live_access(
    session_id: int,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    """Issue a short-lived permission for a doctor to join a live session."""
    session = db.query(RehabilitationSession).filter(RehabilitationSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active",
        )

    if not is_doctor_authorized(db, current_user.id, session.patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to observe this patient",
        )

    live_token = create_access_token(
        data={
            "sub": str(current_user.id),
            "role": current_user.role.value,
            "session_id": session_id,
            "patient_id": session.patient_id,
            "purpose": "live_observation",
        },
        expires_delta=timedelta(minutes=5),
    )

    return {
        "session_id": session_id,
        "patient_id": session.patient_id,
        "doctor_id": current_user.id,
        "live_access_token": live_token,
        "expires_in_seconds": 300,
        "message": "Use this short-lived token with the real-time streaming layer",
    }
