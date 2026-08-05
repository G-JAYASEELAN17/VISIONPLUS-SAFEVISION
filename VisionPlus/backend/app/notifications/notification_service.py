"""
Notification service.

BEFORE: notify_admin() only logged to stdout — nothing was queryable, so
the Notification Center in the UI had no real data source.

NOW: also persists a Notification row so GET /notifications/ returns real,
durable data. Logging is kept (useful for server-side observability
regardless of the DB), and this remains the integration point to extend
with email/Slack/webhook delivery later — that part is intentionally not
implemented here since it requires real external credentials (SMTP/Slack
webhook URL) that aren't part of this project; see DEPLOYMENT.md.
"""
import logging

from sqlalchemy.orm import Session

from app.models.notification import Notification

logger = logging.getLogger("visionplus.notifications")

_LEVEL_TITLES = {
    "MEDIUM": "Moderate crowd density",
    "HIGH": "High crowd density detected",
    "CRITICAL": "Critical crowd density",
}


def notify_admin(people_count: int, risk: str, frame: int = 0, db: Session | None = None, video_id: int | None = None) -> None:
    """Log a high-risk crowd event and, if a DB session is provided,
    persist it as a real Notification row. `db` is optional so existing
    call sites that only care about logging keep working unchanged."""
    logger.warning(
        "[ALERT] Risk=%s | People=%d | Frame=%d", risk, people_count, frame
    )

    if db is None:
        return

    note = Notification(
        title=_LEVEL_TITLES.get(risk, "Crowd alert"),
        message=f"{people_count} people detected at frame {frame} (risk: {risk}).",
        level=risk,
        video_id=video_id,
    )
    db.add(note)
    # Intentionally not committing here — the caller (analyze.py) is
    # already inside a larger transaction and commits at the end of the
    # analysis loop/run, same pattern as save_detection/save_event/etc.
