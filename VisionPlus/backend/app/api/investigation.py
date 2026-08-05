from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.detection import Detection

router = APIRouter(prefix="/investigation", tags=["Investigation"])


@router.get("/{video_id}")
def investigation(
    video_id: int,
    limit: int = Query(default=500, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    detections = (
        db.query(Detection)
        .filter(Detection.video_id == video_id)
        .order_by(Detection.frame_number)
        .limit(limit)
        .all()
    )
    timeline = [
        {
            "frame": d.frame_number,
            "people": d.people_count,
            "vehicles": d.vehicle_count,
            "objects": d.object_count,
            "risk": d.risk_level,
            "confidence": round(d.confidence or 0, 4),
        }
        for d in detections
    ]
    return {"video_id": video_id, "timeline": timeline}
