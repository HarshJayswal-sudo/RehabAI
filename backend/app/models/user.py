from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    authorizations_as_patient = relationship(
        "DoctorPatientAuthorization",
        foreign_keys="DoctorPatientAuthorization.patient_id",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    authorizations_as_doctor = relationship(
        "DoctorPatientAuthorization",
        foreign_keys="DoctorPatientAuthorization.doctor_id",
        back_populates="doctor",
        cascade="all, delete-orphan",
    )
    sessions = relationship(
        "RehabilitationSession",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
