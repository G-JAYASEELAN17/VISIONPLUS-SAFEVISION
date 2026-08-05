from sqlalchemy.orm import Session
from app.models.event import Event


def save_event(
    db: Session,
    video_id: int,
    frame_number: int,
    event_type: str,
    severity: str,
    description: str,
) -> Event:
    e = Event(
        video_id=video_id,
        frame_number=frame_number,
        event_type=event_type,
        severity=severity,
        description=description,
    )
    db.add(e)
    return e
