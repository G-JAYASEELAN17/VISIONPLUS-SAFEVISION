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
import os
import sys
import time
import logging

import cv2
import numpy as np
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.ai.stream_processor import process_frame, reset_live_tracker
from app.services.live_state import live_state

router = APIRouter(prefix="/stream", tags=["Live Stream"])
log = logging.getLogger("visionplus.stream")


def _placeholder_jpeg(message: str, color=(0, 0, 255)) -> bytes:
    blank = np.zeros((480, 640, 3), dtype="uint8")
    cv2.putText(blank, message, (30, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
    _, buf = cv2.imencode(".jpg", blank)
    return buf.tobytes()


def _mjpeg_chunk(jpg_bytes: bytes) -> bytes:
    return b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpg_bytes + b"\r\n"


def _open_capture(source: str) -> cv2.VideoCapture | None:
    """
    Open a VideoCapture from the given source string.
    Logs exactly which source is being attempted so it can be confirmed
    in the uvicorn console output.
    """
    log.info("Opening VideoCapture — source=%r", source)

    # URL-based sources: DroidCam (http/https) or RTSP
    if source.startswith(("rtsp://", "http://", "https://")):
        log.info("Connecting to URL: %r", source)
        cap = cv2.VideoCapture(source)
        return cap

    # File-based source: uploaded .mp4
    if source.endswith(".mp4") or source.endswith(".avi") or source.endswith(".mov"):
        log.info("Opening video file: %r", source)
        cap = cv2.VideoCapture(source)
        return cap

    # Webcam index (default)
    try:
        idx = int(source)
    except ValueError:
        log.warning("Unknown source format %r, defaulting to webcam 0", source)
        idx = 0

    log.info("Opening webcam index: %s", idx)
    if sys.platform.startswith("win"):
        cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
    else:
        cap = cv2.VideoCapture(idx)
    return cap


def _generate_frames():
    # Not started: show a placeholder without touching any camera.
    if not live_state.is_running:
        yield _mjpeg_chunk(_placeholder_jpeg("Monitoring stopped - press Start", (0, 165, 255)))
        return

    # Snapshot source once so it stays consistent for this stream session.
    source = live_state.camera_source
    cap = None

    # ── Render cloud environment bypass ───────────────────────────────────────
    if os.environ.get("RENDER"):
        demo_video = "uploads/videos/demo.mp4"
        log.info("RENDER env detected — trying demo video: %s", demo_video)
        if os.path.exists(demo_video):
            cap = cv2.VideoCapture(demo_video)
    else:
        # ── Normal environment: try the configured source ──────────────────
        cap = _open_capture(source)

    # ── Fallback 1: demo video ────────────────────────────────────────────────
    if not cap or not cap.isOpened():
        demo_video = "uploads/videos/demo.mp4"
        log.warning("Primary source failed — falling back to: %s", demo_video)
        log.warning("Source %r failed to open; trying demo video", source)
        if os.path.exists(demo_video):
            cap = cv2.VideoCapture(demo_video)

    # ── Fallback 2: placeholder frame ─────────────────────────────────────────
    if not cap or not cap.isOpened():
        live_state.update_stats(camera_status="unavailable", connection_status="error")
        log.error("No camera available — sending placeholder frame")
        yield _mjpeg_chunk(_placeholder_jpeg("No Camera Available", (0, 0, 255)))
        return

    live_state.update_stats(camera_status="connected", connection_status="connected")
    log.info("Stream open and running — source=%r", source)
    frame_count = 0
    window_start = time.time()
    last_annotated = None

    try:
        while live_state.is_running:
            if live_state.is_paused:
                # Freeze on the last good frame while paused.
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
                log.error("cap.read() returned False — camera disconnected")
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
        log.info("Generator exited — cap released")


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
    Includes camera_source so the frontend can confirm which source is active."""
    snap = live_state.snapshot()
    # Expose camera_source explicitly in the status response.
    snap["camera_source"] = live_state.camera_source
    return snap


@router.post("/start")
def start():
    reset_live_tracker()
    live_state.start()
    log.info("/start — camera_source=%r", live_state.camera_source)
    return live_state.snapshot()


@router.post("/stop")
def stop():
    live_state.stop()
    log.info("/stop called")
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
    log.info("/restart — camera_source=%r", live_state.camera_source)
    return live_state.snapshot()


@router.post("/detection-toggle")
def detection_toggle():
    enabled = live_state.toggle_detection()
    return {"detection_enabled": enabled}


class SourceRequest(BaseModel):
    source: str = "0"


@router.post("/source")
def set_source(body: SourceRequest):
    """Update the camera source. Accepts webcam index, RTSP URL,
    HTTP/HTTPS URL (e.g. DroidCam), or path to an uploaded .mp4 file.
    The new source takes effect on the next /stream/start or /stream/restart."""
    live_state.set_source(body.source)
    log.info("/source updated — camera_source=%r", body.source)
    return {"success": True, "camera_source": body.source}
