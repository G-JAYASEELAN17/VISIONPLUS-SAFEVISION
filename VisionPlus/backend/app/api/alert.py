from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.alert import Alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/")
def get_alerts(
    limit: int = Query(default=50, ge=1, le=500),
    skip: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
