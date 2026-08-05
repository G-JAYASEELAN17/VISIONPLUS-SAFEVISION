"""
Live Monitoring API.

BEFORE: a single GET /stream/ endpoint that unconditionally opened the
server's webcam and streamed MJPEG forever — no start/stop, no stats, no
way to know if a camera was even present without opening the <img> tag.

NOW: a real control plane (start/stop/pause/resume/restart/detection
toggle) backed by app/services/live_state.py, plus GET /stream/status for
polling current people/vehicle/object counts, FPS, latency, and
camera/connection status from outside the MJPEG stream (e.g. the dashboard
widgets, which can't parse a multipart stream).
"""
import time

import cv2
import numpy as np
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.ai.stream_processor import process_frame, reset_live_tracker
from app.services.live_state import live_state

router = APIRouter(prefix="/stream", tags=["Live Stream"])


def _placeholder_jpeg(message: str, color=(0, 0, 255)) -> bytes:
    blank = np.zeros((480, 640, 3), dtype="uint8")
    cv2.putText(blank, message, (30, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
    _, buf = cv2.imencode(".jpg", blank)
    return buf.tobytes()


def _mjpeg_chunk(jpg_bytes: bytes) -> bytes:
    return b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpg_bytes + b"\r\n"


def _generate_frames():
    # Not started: never touch the camera. Show a clear, immediate
    # placeholder instead of silently hanging or crashing.
    if not live_state.is_running:
        yield _mjpeg_chunk(_placeholder_jpeg("Monitoring stopped - press Start", (0, 165, 255)))
        return

    cap = cv2.VideoCapture(live_state.camera_index)
    if not cap.isOpened():
        live_state.update_stats(camera_status="unavailable", connection_status="error")
        yield _mjpeg_chunk(_placeholder_jpeg("No camera available", (0, 0, 255)))
        return

    live_state.update_stats(camera_status="connected", connection_status="connected")
    frame_count = 0
    window_start = time.time()
    last_annotated = None

    try:
        while live_state.is_running:
            if live_state.is_paused:
                # Freeze on the last annotated frame rather than reading new
                # ones from the camera — this is what "Pause" means here.
                if last_annotated is not None:
                    _, buf = cv2.imencode(".jpg", last_annotated)
                    yield _mjpeg_chunk(buf.tobytes())
                else:
                    yield _mjpeg_chunk(_placeholder_jpeg("Paused", (255, 165, 0)))
                time.sleep(0.2)
                continue

            ok, frame = cap.read()
            if not ok:
                live_state.update_stats(camera_status="error", connection_status="error")
                yield _mjpeg_chunk(_placeholder_jpeg("Camera read failed", (0, 0, 255)))
                break

            annotated, stats = process_frame(frame, detection_enabled=live_state.detection_enabled)
            last_annotated = annotated

            frame_count += 1
            elapsed = time.time() - window_start
            fps = round(frame_count / elapsed, 1) if elapsed > 0 else 0.0

            live_state.update_stats(
                frame_time=time.time(),
                fps=fps,
                camera_status="connected",
                connection_status="connected",
                **stats,
            )

            _, buffer = cv2.imencode(".jpg", annotated)
            yield _mjpeg_chunk(buffer.tobytes())
    finally:
        cap.release()
        if not live_state.is_running:
            live_state.update_stats(camera_status="unknown", connection_status="disconnected")


@router.get("/")
def stream():
    """MJPEG stream. Safe to leave mounted in an <img> tag at all times —
    it renders a placeholder until /stream/start is called."""
    return StreamingResponse(
        _generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.get("/status")
def status():
    """Poll current live-monitoring state + latest per-frame stats.
    Used by the dashboard and Live Monitoring page — does not require
    parsing the MJPEG stream itself."""
    return live_state.snapshot()


@router.post("/start")
def start():
    reset_live_tracker()
    live_state.start()
    return live_state.snapshot()


@router.post("/stop")
def stop():
    live_state.stop()
    return live_state.snapshot()


@router.post("/pause")
def pause():
    live_state.pause()
    return live_state.snapshot()


@router.post("/resume")
def resume():
    live_state.resume()
    return live_state.snapshot()


@router.post("/restart")
def restart():
    reset_live_tracker()
    live_state.restart()
    return live_state.snapshot()


@router.post("/detection-toggle")
def detection_toggle():
    enabled = live_state.toggle_detection()
    return {"detection_enabled": enabled}
