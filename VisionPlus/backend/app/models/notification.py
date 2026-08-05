from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Notification(Base):
    """Persisted notification (Notification Center). Previously
    notify_admin() only wrote to the application log — nothing was stored,
    so the frontend had nothing real to display or mark as read."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(String(500), nullable=False)
    level = Column(String(20), default="INFO")  # INFO | WARNING | HIGH | CRITICAL
    video_id = Column(Integer, nullable=True, index=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
