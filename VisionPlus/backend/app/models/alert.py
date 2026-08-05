from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, nullable=False, index=True)
    frame_number = Column(Integer)
    people_count = Column(Integer)
    risk_level = Column(String(20))
    message = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
