from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(50), nullable=True, unique=True, index=True)  # e.g. leg_extension, squat, windwheel_toe_touch
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    body_part = Column(String(50), nullable=True, index=True)  # e.g. leg, arm, shoulder, spine
    difficulty = Column(String(30), nullable=True)  # beginner, intermediate, advanced
    instructions = Column(Text, nullable=True)
    target_rom = Column(Float, nullable=True)  # Target Range of Motion (degrees)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("RehabilitationSession", back_populates="exercise")

    def __repr__(self):
        return f"<Exercise(id={self.id}, code={self.code}, name={self.name})>"
