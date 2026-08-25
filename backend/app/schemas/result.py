from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import datetime
from typing import Optional, List, Any, Dict


class RepetitionDetail(BaseModel):
    rep: int
    score: Optional[float] = Field(None, ge=0, le=100)
    rom: Optional[float] = Field(None, ge=0, description="Range of Motion in degrees")
    highest_angle: Optional[float] = None
    lowest_angle: Optional[float] = None
    errors: Optional[List[str]] = Field(default_factory=list)
    feedback: Optional[str] = None

    model_config = ConfigDict(extra="allow")


class ExerciseResultCreate(BaseModel):
    """
    AI/CV module payload.
    Supports both direct AI team format (exercise, average_score, average_rom, repetitions_detail)
    and standard backend format.
    """
    exercise: Optional[str] = Field(None, description="Exercise code e.g. leg_extension, squat")
    repetitions: Optional[int] = Field(None, ge=0)
    correct_repetitions: Optional[int] = Field(None, ge=0)
    incorrect_repetitions: Optional[int] = Field(None, ge=0)
    score: Optional[float] = Field(None, ge=0, le=100)
    average_score: Optional[float] = Field(None, ge=0, le=100)
    average_rom: Optional[float] = Field(None, ge=0, description="Average Range of Motion in degrees")
    feedback: Optional[str] = None
    errors: Optional[List[str]] = None
    video_filename: Optional[str] = Field(None, description="Source video filename if available")
    repetitions_detail: Optional[List[RepetitionDetail]] = None
    ai_result: Optional[Dict[str, Any]] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_ai_fields(cls, values: Any) -> Any:
        if not isinstance(values, dict):
            return values

        # Normalize video filename if present
        if not values.get("video_filename"):
            for v_key in ("video", "video_name", "source_video", "file_name", "filename"):
                if values.get(v_key):
                    values["video_filename"] = str(values[v_key]).strip()
                    break

        # 1. Map average_score -> score if score not given
        if values.get("score") is None and values.get("average_score") is not None:
            values["score"] = values["average_score"]

        # 2. Extract reps detail metrics if provided
        reps_detail = values.get("repetitions_detail")
        if isinstance(reps_detail, list) and reps_detail:
            # Auto set repetitions count
            if values.get("repetitions") is None:
                values["repetitions"] = len(reps_detail)

            # Auto calculate correct vs incorrect
            if values.get("correct_repetitions") is None:
                correct = sum(
                    1 for r in reps_detail
                    if isinstance(r, dict)
                    and not r.get("errors")
                    and (r.get("score") is None or r.get("score", 0) >= 70)
                )
                values["correct_repetitions"] = correct
                if values.get("incorrect_repetitions") is None:
                    values["incorrect_repetitions"] = max(0, len(reps_detail) - correct)

            # Auto compile feedback if missing
            if not values.get("feedback"):
                feedbacks = [r.get("feedback") for r in reps_detail if isinstance(r, dict) and r.get("feedback")]
                if feedbacks:
                    values["feedback"] = " | ".join(dict.fromkeys(feedbacks))  # unique preserving order

            # Auto compile errors if missing
            if values.get("errors") is None:
                all_errs = []
                for r in reps_detail:
                    if isinstance(r, dict) and r.get("errors"):
                        for e in r.get("errors", []):
                            if e not in all_errs:
                                all_errs.append(e)
                values["errors"] = all_errs

        # 3. Store the entire payload in ai_result if not explicitly set
        if values.get("ai_result") is None:
            values["ai_result"] = {k: v for k, v in values.items() if k not in ("session_id",)}

        return values


class AIExerciseResultPayload(BaseModel):
    """
    Direct mapping for the AI team's JSON output structure.
    """
    exercise: Optional[str] = None
    video_filename: Optional[str] = None
    repetitions: int = 0
    average_score: Optional[float] = 0.0
    average_rom: Optional[float] = 0.0
    repetitions_detail: List[RepetitionDetail] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")


class ExerciseResultResponse(BaseModel):
    id: int
    session_id: int
    video_filename: Optional[str] = None
    repetitions: Optional[int] = None
    correct_repetitions: Optional[int] = None
    incorrect_repetitions: Optional[int] = None
    score: Optional[float] = None
    average_rom: Optional[float] = None
    feedback: Optional[str] = None
    errors: Optional[List[str]] = None
    repetitions_detail: Optional[List[Dict[str, Any]]] = None
    ai_result: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
