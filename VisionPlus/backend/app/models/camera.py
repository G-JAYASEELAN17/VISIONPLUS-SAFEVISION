from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_name = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    stream_url = Column(String(500), nullable=False)
    status = Column(String(20), default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
