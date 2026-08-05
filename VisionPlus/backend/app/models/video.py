from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    # "Uploaded" → "Analyzing" → "Analyzed" | "Failed"
    status = Column(String(50), default="Uploaded")
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
