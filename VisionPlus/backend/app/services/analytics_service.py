from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.detection import Detection
from app.models.alert import Alert


def analytics_summary(db: Session) -> dict:
    total_people = db.query(func.sum(Detection.people_count)).scalar() or 0
    total_vehicles = db.query(func.sum(Detection.vehicle_count)).scalar() or 0
    total_objects = db.query(func.sum(Detection.object_count)).scalar() or 0
    total_detections = db.query(Detection).count()
    avg_people = (total_people / total_detections) if total_detections else 0
    avg_vehicles = (total_vehicles / total_detections) if total_detections else 0
    total_alerts = db.query(Alert).count()

    risk_distribution = {
        level: db.query(Detection).filter(Detection.risk_level == level).count()
        for level in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    }

    # Zone averages across all analyses
    from app.models.zone_analytics import ZoneAnalytics
    zone_row = db.query(
        func.avg(ZoneAnalytics.zone_a),
        func.avg(ZoneAnalytics.zone_b),
        func.avg(ZoneAnalytics.zone_c),
        func.avg(ZoneAnalytics.zone_d),
    ).first()

    zone_averages = {
        "Zone A": round(zone_row[0] or 0, 1),
        "Zone B": round(zone_row[1] or 0, 1),
        "Zone C": round(zone_row[2] or 0, 1),
        "Zone D": round(zone_row[3] or 0, 1),
    }

    return {
        "total_people": int(total_people),
        "total_vehicles": int(total_vehicles),
        "total_objects": int(total_objects),
        "average_people": round(avg_people, 2),
        "average_vehicles": round(avg_vehicles, 2),
        "total_alerts": total_alerts,
        "risk_distribution": risk_distribution,
        "zone_averages": zone_averages,
    }
