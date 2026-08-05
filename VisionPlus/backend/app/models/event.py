from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, nullable=False, index=True)
    frame_number = Column(Integer)
    event_type = Column(String(100))
    severity = Column(String(20))
    description = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
