from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.event import Event

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/{video_id}")
def get_events(
    video_id: int,
    limit: int = Query(default=200, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    return (
        db.query(Event)
        .filter(Event.video_id == video_id)
        .order_by(Event.frame_number)
        .limit(limit)
        .all()
    )
