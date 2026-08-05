from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def get_notifications(
    limit: int = Query(default=50, ge=1, le=200),
    unread_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    q = db.query(Notification)
    if unread_only:
        q = q.filter(Notification.is_read.is_(False))
    rows = q.order_by(Notification.created_at.desc()).limit(limit).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "level": n.level,
            "video_id": n.video_id,
            "is_read": n.is_read,
            "created_at": str(n.created_at),
        }
        for n in rows
    ]


@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db)):
    count = db.query(Notification).filter(Notification.is_read.is_(False)).count()
    return {"unread_count": count}


@router.post("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    note = db.query(Notification).filter(Notification.id == notification_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found")
    note.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.is_read.is_(False)).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
