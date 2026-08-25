from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.exercise import Exercise
from app.models.user import User, UserRole
from app.schemas.exercise import ExerciseCreate, ExerciseResponse, ExerciseUpdate
from app.dependencies.auth import get_current_user, require_doctor

router = APIRouter(prefix="/exercises", tags=["Exercises"])


@router.get("", response_model=List[ExerciseResponse])
def list_exercises(
    active_only: bool = True,
    body_part: Optional[str] = None,
    code: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Exercise)
    if active_only:
        query = query.filter(Exercise.active == True)
    if body_part:
        query = query.filter(Exercise.body_part == body_part)
    if code:
        query = query.filter(Exercise.code == code)
    return query.order_by(Exercise.name).all()


@router.get("/code/{code}", response_model=ExerciseResponse)
def get_exercise_by_code(code: str, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(Exercise.code == code).first()
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Exercise with code '{code}' not found")
    return exercise


@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")
    return exercise


@router.post("", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(
    payload: ExerciseCreate,
    current_user: User = Depends(require_doctor),  # simple: only doctors can create for now
    db: Session = Depends(get_db),
):
    existing = db.query(Exercise).filter(Exercise.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Exercise name already exists")

    exercise = Exercise(**payload.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


@router.put("/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    exercise_id: int,
    payload: ExerciseUpdate,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exercise, field, value)

    db.commit()
    db.refresh(exercise)
    return exercise
