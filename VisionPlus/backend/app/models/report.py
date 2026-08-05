from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, nullable=False, index=True)
    total_frames = Column(Integer)
    maximum_people = Column(Integer)
    average_people = Column(Float)
    # Added for vehicle-count support in reports/exports.
    maximum_vehicles = Column(Integer, default=0)
    average_vehicles = Column(Float, default=0)
    highest_risk = Column(String(20))
    processing_time = Column(Float)
    output_video = Column(String)
    entry_count = Column(Integer, default=0)
    exit_count = Column(Integer, default=0)
    ai_summary = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
