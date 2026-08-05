"""
Bug fixed: original called create_alert() on EVERY frame, which means a
10-minute video at 30fps generates 18,000 alert rows — unusable.

Fix: only create an alert when the risk level CHANGES (state machine).
This gives meaningful events: "risk went LOW → HIGH at frame 450".
"""
from sqlalchemy.orm import Session
from app.models.alert import Alert


_RISK_MESSAGES = {
    "LOW":      "Crowd density is safe",
    "MEDIUM":   "Crowd density is moderate — monitor closely",
    "HIGH":     "High crowd density detected — caution advised",
    "CRITICAL": "Critical crowd density — immediate action required",
}


def create_alert_on_change(
    db: Session,
    video_id: int,
    frame_number: int,
    people_count: int,
    risk_level: str,
    previous_risk: str | None,
) -> Alert | None:
    """Create an alert only when the risk level changes. Returns the Alert or None."""
    if risk_level == previous_risk:
        return None

    # Only alert for MEDIUM and above escalations (not every LOW→LOW)
    if risk_level == "LOW" and previous_risk is None:
        return None

    alert = Alert(
        video_id=video_id,
        frame_number=frame_number,
        people_count=people_count,
        risk_level=risk_level,
        message=_RISK_MESSAGES.get(risk_level, "Unknown risk level"),
    )
    db.add(alert)
    return alert
