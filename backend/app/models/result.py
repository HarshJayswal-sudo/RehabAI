from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class ExerciseResult(Base):
    __tablename__ = "exercise_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("rehabilitation_sessions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Core metrics (common across exercises; optional so AI can evolve)
    repetitions = Column(Integer, nullable=True)
    correct_repetitions = Column(Integer, nullable=True)
    incorrect_repetitions = Column(Integer, nullable=True)
    score = Column(Float, nullable=True)  # 0-100 (maps to average_score from AI)
    average_rom = Column(Float, nullable=True)  # Average Range of Motion in degrees
    feedback = Column(Text, nullable=True)
    errors = Column(JSON, nullable=True)  # list of error strings
    repetitions_detail = Column(JSON, nullable=True)  # detailed per-rep breakdown

    # Video and media reference
    video_filename = Column(String(255), nullable=True)

    # Flexible AI-specific payload – stores full raw AI result
    ai_result = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("RehabilitationSession", back_populates="results")

    def __repr__(self):
        return f"<ExerciseResult(id={self.id}, session={self.session_id}, score={self.score})>"
