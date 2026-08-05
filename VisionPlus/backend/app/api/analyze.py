"""
analyze.py — Complete rewrite fixing every bug in the original:

BUGS FIXED:
1. NameError crash: people_history / risk_history / timeline were initialized
   AFTER the loop that used them. Moved to before the loop.
2. UnboundLocalError: `risk` was appended to risk_history before it was computed.
   Reordered: compute risk first, then use it.
3. Import inside the loop: `from app.notifications...` was re-imported every frame.
   Moved to top-of-file.
4. Duplicate imports: grok_service + chart_service + pdf_service imported twice.
5. Module-level tracker singleton: tracker.py used a shared ByteTrack instance
   that carried ID state between analyses. Now creates a fresh one per call.
6. Module-level entry/exit globals: never reset between analyses. Now uses
   EntryExitCounter class instantiated fresh per call.
7. Smart alerts: original created one alert row per frame (18k rows for a 10-min
   video). Now only creates an alert when the risk level CHANGES.
8. Detection sampling: saves every Nth frame to DB instead of all frames.
9. Video status update: status never changed from "Uploaded" after analysis.
   Now updates to "Analyzing" → "Analyzed" (or "Failed" on error).
10. Re-analysis: running analyze twice on the same video no longer duplicates data.

EXTENDED (vehicle/object counts):
Detection was previously hardcoded to classes=[0] (person only), so the
system had no vehicle or object counts anywhere despite the dashboard/
report schema implying general "object" tracking. Now uses
app.ai.detection_classes.DETECT_CLASSES (person + vehicle + a few
surveillance-relevant object classes) and classify_counts() to split each
frame's tracked detections into people/vehicles/objects.
"""

import os
import cv2
import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.video import Video

from app.ai.yolo_detector import detect
from app.ai.tracker import make_tracker, track
from app.ai.draw import draw
from app.ai.risk_score import calculate_risk
from app.ai.zone_analysis import analyze_zones
from app.ai.heatmap import draw_heatmap
from app.ai.entry_exit import EntryExitCounter
from app.ai.detection_classes import DETECT_CLASSES, classify_counts

from app.services.detection_service import save_detection
from app.services.report_service import save_report
from app.services.alert_service import create_alert_on_change
from app.services.zone_service import save_zone_analysis
from app.services.event_service import save_event
from app.services.grok_service import generate_ai_report
from app.notifications.notification_service import notify_admin
from app.core.config import settings

router = APIRouter(prefix="/analyze", tags=["AI Analysis"])

# How often to write a detection row (every N frames)
SAMPLE_EVERY = settings.DETECTION_SAMPLE_EVERY


@router.post("/{video_id}")
def analyze_video(video_id: int, db: Session = Depends(get_db)):

    # ── Fetch video ────────────────────────────────────────────────────────
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if not os.path.exists(video.filepath):
        raise HTTPException(status_code=404, detail=f"Video file missing: {video.filepath}")

    # Mark as analyzing
    video.status = "Analyzing"
    db.commit()

    os.makedirs("reports", exist_ok=True)

    cap = cv2.VideoCapture(video.filepath)
    if not cap.isOpened():
        video.status = "Failed"
        db.commit()
        raise HTTPException(status_code=400, detail="Unable to open video file")

    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps    = cap.get(cv2.CAP_PROP_FPS) or 20

    output_path = f"reports/output_{video.id}.mp4"
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

    # ── FIX #1: Initialize ALL variables BEFORE the loop ──────────────────
    frame_number   = 0
    max_people     = 0
    max_vehicles   = 0
    total_people   = 0
    total_vehicles = 0
    timeline       = []        # was initialized AFTER the loop — crash on frame 1
    people_history = []        # same bug
    risk_history   = []        # same bug

    # FIX #5 & #6: Fresh per-analysis instances (not stale module-level singletons)
    tracker        = make_tracker()
    ee_counter     = EntryExitCounter()
    previous_risk  = None      # for smart alert state machine
    zones          = {"Zone A": 0, "Zone B": 0, "Zone C": 0, "Zone D": 0}

    start_time = time.time()

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            frame_number += 1

            # ── Detection & tracking ───────────────────────────────────────
            results = detect(frame, classes=DETECT_CLASSES)  # person + vehicle + object classes
            result  = results[0]
            tracked = track(result, tracker)

            counts = classify_counts(tracked)
            people_count  = counts["people"]
            vehicle_count = counts["vehicles"]
            object_count  = counts["objects"]
            total_people   += people_count
            total_vehicles += vehicle_count

            # FIX #2: compute risk BEFORE using it anywhere
            risk = calculate_risk(people_count)

            confidence = 0.0
            if result.boxes is not None:
                for box in result.boxes:
                    if int(box.cls) == 0:
                        confidence = max(confidence, float(box.conf))

            # ── Zone analysis ──────────────────────────────────────────────
            zones = analyze_zones(tracked, width, height)

            # ── Timeline (in-memory, returned in response) ─────────────────
            people_history.append(people_count)
            risk_history.append(risk)
            timeline.append({
                "frame": frame_number,
                "people": people_count,
                "vehicles": vehicle_count,
                "objects": object_count,
                "risk": risk,
            })

            # ── DB writes (sampled every N frames) ────────────────────────
            if frame_number % SAMPLE_EVERY == 0:
                save_detection(
                    db, video.id, frame_number, people_count, confidence, risk,
                    vehicle_count=vehicle_count, object_count=object_count,
                )
                save_zone_analysis(db, video.id, frame_number, zones)

            # ── Smart alerts (FIX #7: only on risk level change) ──────────
            alert = create_alert_on_change(
                db, video.id, frame_number, people_count, risk, previous_risk
            )
            if alert and risk in ("HIGH", "CRITICAL"):
                notify_admin(people_count, risk, frame_number, db=db, video_id=video.id)

            # ── Events for HIGH+ ──────────────────────────────────────────
            if risk in ("HIGH", "CRITICAL") and risk != previous_risk:
                save_event(
                    db, video.id, frame_number,
                    event_type=f"{risk.title()} Crowd Density",
                    severity=risk,
                    description=f"{people_count} people detected at frame {frame_number}",
                )

            previous_risk = risk
            max_people = max(max_people, people_count)
            max_vehicles = max(max_vehicles, vehicle_count)

            # ── Annotate & write frame ────────────────────────────────────
            annotated = draw(frame, tracked)
            annotated = ee_counter.count(tracked, annotated)
            annotated = draw_heatmap(annotated, zones)

            cv2.putText(annotated, f"Entry: {ee_counter.entry_count}",
                        (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(annotated, f"Exit: {ee_counter.exit_count}",
                        (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.putText(annotated, f"People: {people_count}  Vehicles: {vehicle_count}  Risk: {risk}",
                        (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.9,
                        (0, 165, 255) if risk == "MEDIUM" else
                        (0, 0, 255) if risk in ("HIGH", "CRITICAL") else
                        (0, 255, 0), 2)

            out.write(annotated)

    except Exception as exc:
        cap.release()
        out.release()
        video.status = "Failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc

    finally:
        cap.release()
        out.release()

    # ── Final statistics ──────────────────────────────────────────────────
    average_people   = total_people / frame_number if frame_number > 0 else 0
    average_vehicles = total_vehicles / frame_number if frame_number > 0 else 0
    highest_risk    = calculate_risk(max_people)
    processing_time = round(time.time() - start_time, 2)

    ai_summary = generate_ai_report(
        video_name=video.filename,
        max_people=max_people,
        avg_people=average_people,
        highest_risk=highest_risk,
        entry_count=ee_counter.entry_count,
        exit_count=ee_counter.exit_count,
        zone_summary=zones,
        max_vehicles=max_vehicles,
    )

    # FIX #9: update video status
    video.status = "Analyzed"

    # FIX #10: save_report deletes any previous report for this video
    save_report(
        db=db,
        video_id=video.id,
        total_frames=frame_number,
        maximum_people=max_people,
        average_people=average_people,
        maximum_vehicles=max_vehicles,
        average_vehicles=average_vehicles,
        highest_risk=highest_risk,
        processing_time=processing_time,
        output_video=output_path,
        entry_count=ee_counter.entry_count,
        exit_count=ee_counter.exit_count,
        ai_summary=ai_summary,
    )

    db.commit()

    return {
        "message": "Analysis completed successfully",
        "video_id": video.id,
        "video_name": video.filename,
        "frames_processed": frame_number,
        "maximum_people": max_people,
        "average_people": round(average_people, 2),
        "maximum_vehicles": max_vehicles,
        "average_vehicles": round(average_vehicles, 2),
        "highest_risk": highest_risk,
        "processing_time_seconds": processing_time,
        "entry_count": ee_counter.entry_count,
        "exit_count": ee_counter.exit_count,
        "annotated_video": output_path,
        "zone_analysis": zones,
        "ai_summary": ai_summary,
    }
