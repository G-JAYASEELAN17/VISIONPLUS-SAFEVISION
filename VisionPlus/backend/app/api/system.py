import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.database import get_db
from app.core.config import settings

router = APIRouter(prefix="/system", tags=["System"])


@router.get("/health")
def health(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "Vision+",
        "version": "2.0.0",
        "database": "connected" if db_ok else "error",
        "grok_enabled": settings.grok_enabled(),
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }
