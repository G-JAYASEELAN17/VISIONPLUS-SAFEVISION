from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class ZoneAnalytics(Base):
    __tablename__ = "zone_analytics"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, nullable=False, index=True)
    frame_number = Column(Integer, nullable=False)
    zone_a = Column(Integer, default=0)
    zone_b = Column(Integer, default=0)
    zone_c = Column(Integer, default=0)
    zone_d = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
