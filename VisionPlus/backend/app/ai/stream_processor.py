"""
Extended for Live Monitoring controls: process_frame() now returns a full
stats dict (people/vehicle/object counts, risk, per-frame latency) instead
of just a people count, and accepts detection_enabled=False so the
Detection Toggle in the UI can show a raw feed without running YOLO.
"""
import time

import cv2

from app.ai.yolo_detector import detect
from app.ai.tracker import make_tracker, track
from app.ai.draw import draw
from app.ai.risk_score import calculate_risk
from app.ai.detection_classes import DETECT_CLASSES, classify_counts

# Each live monitoring session gets its own tracker instance, reset via
# reset_live_tracker() whenever Start/Restart is pressed (see live_state.py)
# so tracker IDs don't leak across sessions — the same bug class that was
# already fixed for offline analysis (see app/ai/tracker.py docstring).
_live_tracker = None


def get_live_tracker():
    global _live_tracker
    if _live_tracker is None:
        _live_tracker = make_tracker()
    return _live_tracker


def reset_live_tracker():
    global _live_tracker
    _live_tracker = None


def process_frame(frame, detection_enabled: bool = True):
    """Detect, track, annotate a single live frame.

    Returns (annotated_frame, stats) where stats is:
        {people_count, vehicle_count, object_count, risk_level, latency_ms}
    """
    start = time.perf_counter()

    if not detection_enabled:
        latency_ms = round((time.perf_counter() - start) * 1000, 1)
        return frame, {
            "people_count": 0,
            "vehicle_count": 0,
            "object_count": 0,
            "risk_level": "LOW",
            "latency_ms": latency_ms,
            "zones": {"Zone A": 0, "Zone B": 0, "Zone C": 0, "Zone D": 0},
        }

    results = detect(frame, classes=DETECT_CLASSES)
    result = results[0]
    tracked = track(result, get_live_tracker())
    counts = classify_counts(tracked)
    risk = calculate_risk(counts["people"])
    
    # Generate live zone analytics based on current frame detections
    from app.ai.zone_analysis import analyze_zones
    zones = analyze_zones(tracked, frame.shape[1], frame.shape[0])
    
    annotated = draw(frame, tracked)

    latency_ms = round((time.perf_counter() - start) * 1000, 1)

    cv2.putText(
        annotated,
        f"People: {counts['people']}  Vehicles: {counts['vehicles']}  Risk: {risk}",
        (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.85,
        (0, 255, 0) if risk == "LOW" else (0, 165, 255) if risk == "MEDIUM" else (0, 0, 255),
        2,
    )

    return annotated, {
        "people_count": counts["people"],
        "vehicle_count": counts["vehicles"],
        "object_count": counts["objects"],
        "risk_level": risk,
        "latency_ms": latency_ms,
        "zones": zones,
    }
