from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.report import Report
from app.models.video import Video
from app.services import report_export_service as export_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/")
def get_reports(db: Session = Depends(get_db)):
    return db.query(Report).order_by(Report.created_at.desc()).all()


@router.get("/{video_id}")
def get_report(video_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.video_id == video_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


def _get_report_and_video(video_id: int, db: Session):
    report = db.query(Report).filter(Report.video_id == video_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    video = db.query(Video).filter(Video.id == video_id).first()
    return report, video


@router.get("/{video_id}/export/json")
def export_report_json(video_id: int, db: Session = Depends(get_db)):
    report, video = _get_report_and_video(video_id, db)
    payload = export_service.export_json(report, video)
    return Response(
        content=payload,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="report_{video_id}.json"'},
    )


@router.get("/{video_id}/export/csv")
def export_report_csv(video_id: int, db: Session = Depends(get_db)):
    report, video = _get_report_and_video(video_id, db)
    payload = export_service.export_csv(db, report, video)
    return Response(
        content=payload,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="report_{video_id}.csv"'},
    )


@router.get("/{video_id}/export/pdf")
def export_report_pdf(video_id: int, db: Session = Depends(get_db)):
    report, video = _get_report_and_video(video_id, db)
    payload = export_service.export_pdf(db, report, video)
    return Response(
        content=payload,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="report_{video_id}.pdf"'},
    )
