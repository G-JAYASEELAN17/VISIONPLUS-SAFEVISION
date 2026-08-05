from sqlalchemy.orm import Session
from app.models.zone_analytics import ZoneAnalytics


def save_zone_analysis(
    db: Session,
    video_id: int,
    frame_number: int,
    zones: dict,
) -> ZoneAnalytics:
    z = ZoneAnalytics(
        video_id=video_id,
        frame_number=frame_number,
        zone_a=zones.get("Zone A", 0),
        zone_b=zones.get("Zone B", 0),
        zone_c=zones.get("Zone C", 0),
        zone_d=zones.get("Zone D", 0),
    )
    db.add(z)
    return z
