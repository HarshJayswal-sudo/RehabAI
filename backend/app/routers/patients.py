from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.session import RehabilitationSession, SessionStatus
from app.models.result import ExerciseResult
from app.schemas.user import UserResponse
from app.schemas.session import SessionResponse
from app.dependencies.auth import require_patient, get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(require_patient)):
    return current_user


@router.get("/me/history", response_model=List[SessionResponse])
def get_my_history(
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(RehabilitationSession)
        .options(
            joinedload(RehabilitationSession.exercise),
            joinedload(RehabilitationSession.results),
        )
        .filter(RehabilitationSession.patient_id == current_user.id)
        .order_by(RehabilitationSession.started_at.desc())
        .all()
    )
    return sessions


def compute_patient_progress(patient_id: int, db: Session) -> dict:
    """Helper to compute aggregated patient rehabilitation analytics."""
    sessions = (
        db.query(RehabilitationSession)
        .options(
            joinedload(RehabilitationSession.exercise),
            joinedload(RehabilitationSession.results),
        )
        .filter(RehabilitationSession.patient_id == patient_id)
        .order_by(RehabilitationSession.started_at.asc())
        .all()
    )

    total_sessions = len(sessions)
    completed = [s for s in sessions if s.status == SessionStatus.COMPLETED]
    total_completed = len(completed)

    scores = []
    roms = []
    total_reps = 0
    total_correct = 0
    exercise_map = {}
    history_trend = []

    for s in completed:
        ex = s.exercise
        ex_code = ex.code if ex and ex.code else (ex.name if ex else "unknown")
        ex_name = ex.name if ex else "Unknown Exercise"

        if ex_code not in exercise_map:
            exercise_map[ex_code] = {
                "exercise_id": ex.id if ex else None,
                "exercise_code": ex_code,
                "exercise_name": ex_name,
                "body_part": ex.body_part if ex else None,
                "target_rom": ex.target_rom if ex else None,
                "sessions_count": 0,
                "scores": [],
                "roms": [],
                "total_repetitions": 0,
                "total_correct": 0,
                "latest_feedback": None,
            }

        ex_entry = exercise_map[ex_code]
        ex_entry["sessions_count"] += 1

        session_score = None
        session_rom = None
        session_reps = 0

        if s.results:
            res = s.results
            if res.score is not None:
                scores.append(res.score)
                ex_entry["scores"].append(res.score)
                session_score = res.score
            if res.average_rom is not None:
                roms.append(res.average_rom)
                ex_entry["roms"].append(res.average_rom)
                session_rom = res.average_rom
            if res.repetitions is not None:
                total_reps += res.repetitions
                ex_entry["total_repetitions"] += res.repetitions
                session_reps = res.repetitions
            if res.correct_repetitions is not None:
                total_correct += res.correct_repetitions
                ex_entry["total_correct"] += res.correct_repetitions
            if res.feedback:
                ex_entry["latest_feedback"] = res.feedback

        history_trend.append({
            "session_id": s.id,
            "exercise_code": ex_code,
            "exercise_name": ex_name,
            "date": s.started_at.isoformat() if s.started_at else None,
            "score": session_score,
            "average_rom": session_rom,
            "repetitions": session_reps,
            "duration_seconds": s.duration_seconds,
        })

    avg_score = round(sum(scores) / len(scores), 2) if scores else None
    avg_rom = round(sum(roms) / len(roms), 2) if roms else None

    # Format exercise breakdown
    breakdown = []
    for ex_data in exercise_map.values():
        ex_scores = ex_data.pop("scores")
        ex_roms = ex_data.pop("roms")
        ex_data["average_score"] = round(sum(ex_scores) / len(ex_scores), 2) if ex_scores else None
        ex_data["average_rom"] = round(sum(ex_roms) / len(ex_roms), 2) if ex_roms else None
        breakdown.append(ex_data)

    return {
        "patient_id": patient_id,
        "total_sessions": total_sessions,
        "completed_sessions": total_completed,
        "average_score": avg_score,
        "average_rom": avg_rom,
        "total_repetitions": total_reps,
        "total_correct_repetitions": total_correct,
        "sessions_with_scores": len(scores),
        "exercise_breakdown": breakdown,
        "history_trend": history_trend,
    }


@router.get("/me/progress")
def get_my_progress(
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db),
):
    """Aggregate progress & AI analytics for the authenticated patient."""
    return compute_patient_progress(current_user.id, db)
