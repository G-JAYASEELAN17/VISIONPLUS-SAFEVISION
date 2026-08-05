from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.alert import Alert
from app.models.camera import Camera
from app.models.detection import Detection
from app.models.report import Report
from app.models.video import Video
from app.models.notification import Notification
from app.services.live_state import live_state

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    risk_summary = {
        level: db.query(Detection).filter(Detection.risk_level == level).count()
        for level in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    }
    return {
        "total_videos": db.query(Video).count(),
        "total_cameras": db.query(Camera).count(),
        "total_people_detected": db.query(func.sum(Detection.people_count)).scalar() or 0,
        "total_vehicles_detected": db.query(func.sum(Detection.vehicle_count)).scalar() or 0,
        "total_objects_detected": db.query(func.sum(Detection.object_count)).scalar() or 0,
        "total_alerts": db.query(Alert).count(),
        "unread_notifications": db.query(Notification).filter(Notification.is_read.is_(False)).count(),
        "risk_distribution": risk_summary,
        # Connects the Dashboard to Live Monitoring: current stream state
        # without the dashboard needing to parse the MJPEG feed.
        "live_monitoring": live_state.snapshot(),
    }


@router.get("/recent-alerts")
def recent_alerts(db: Session = Depends(get_db)):
    return (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .limit(10)
        .all()
    )


@router.get("/recent-reports")
def recent_reports(db: Session = Depends(get_db)):
    return (
        db.query(Report)
        .order_by(Report.created_at.desc())
        .limit(10)
        .all()
    )
