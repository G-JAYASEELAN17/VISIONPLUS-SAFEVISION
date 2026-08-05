from sqlalchemy.orm import Session
from app.models.detection import Detection


def save_detection(
    db: Session,
    video_id: int,
    frame_number: int,
    people_count: int,
    confidence: float,
    risk_level: str,
    vehicle_count: int = 0,
    object_count: int = 0,
) -> Detection:
    d = Detection(
        video_id=video_id,
        frame_number=frame_number,
        people_count=people_count,
        vehicle_count=vehicle_count,
        object_count=object_count,
        confidence=round(confidence, 4),
        risk_level=risk_level,
    )
    db.add(d)
    return d
