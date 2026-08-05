from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, nullable=False, index=True)
    frame_number = Column(Integer, nullable=False)
    people_count = Column(Integer)
    # Added for vehicle/object-count support (previously detection only
    # ever looked for class 0 = person, so these didn't exist).
    vehicle_count = Column(Integer, default=0)
    object_count = Column(Integer, default=0)
    confidence = Column(Float)
    risk_level = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
