from sqlalchemy.orm import Session
from app.models.report import Report


def save_report(
    db: Session,
    video_id: int,
    total_frames: int,
    maximum_people: int,
    average_people: float,
    highest_risk: str,
    processing_time: float,
    output_video: str,
    entry_count: int = 0,
    exit_count: int = 0,
    ai_summary: str | None = None,
    maximum_vehicles: int = 0,
    average_vehicles: float = 0,
) -> Report:
    # Remove a previous report for the same video (re-analyze scenario)
    db.query(Report).filter(Report.video_id == video_id).delete()

    r = Report(
        video_id=video_id,
        total_frames=total_frames,
        maximum_people=maximum_people,
        average_people=round(average_people, 2),
        maximum_vehicles=maximum_vehicles,
        average_vehicles=round(average_vehicles, 2),
        highest_risk=highest_risk,
        processing_time=round(processing_time, 2),
        output_video=output_video,
        entry_count=entry_count,
        exit_count=exit_count,
        ai_summary=ai_summary,
    )
    db.add(r)
    return r
