from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SAEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class AuthorizationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVOKED = "revoked"


class DoctorPatientAuthorization(Base):
    __tablename__ = "doctor_patient_authorizations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(
        SAEnum(AuthorizationStatus),
        nullable=False,
        default=AuthorizationStatus.PENDING,
        index=True,
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("doctor_id", "patient_id", name="uq_doctor_patient"),
    )

    doctor = relationship(
        "User",
        foreign_keys=[doctor_id],
        back_populates="authorizations_as_doctor",
    )
    patient = relationship(
        "User",
        foreign_keys=[patient_id],
        back_populates="authorizations_as_patient",
    )

    def __repr__(self):
        return f"<Authorization(id={self.id}, doctor={self.doctor_id}, patient={self.patient_id}, status={self.status})>"
