from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SAEnum, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class SessionStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RehabilitationSession(Base):
    __tablename__ = "rehabilitation_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(
        SAEnum(SessionStatus),
        nullable=False,
        default=SessionStatus.ACTIVE,
        index=True,
    )
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)  # calculated on complete
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", back_populates="sessions")
    exercise = relationship("Exercise", back_populates="sessions")
    results = relationship(
        "ExerciseResult",
        back_populates="session",
        cascade="all, delete-orphan",
        uselist=False,  # one primary result per session for simplicity; can be extended
    )

    def __repr__(self):
        return f"<Session(id={self.id}, patient={self.patient_id}, status={self.status})>"
