from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.analytics_service import analytics_summary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/")
def analytics(db: Session = Depends(get_db)):
    return analytics_summary(db)
