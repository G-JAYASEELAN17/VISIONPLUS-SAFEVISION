"""
In-process state machine for the live monitoring stream (Phase: Live
Monitoring controls).

This is a module-level singleton guarded by a lock — intentionally simple.
Vision+ runs the live stream as a single shared camera feed on a single
backend process, so a per-process singleton is the correct minimal
implementation for that shape. If Vision+ is later scaled to multiple
backend workers/dynos, this state needs to move to a shared store (e.g.
Redis) since each worker would otherwise have its own independent
start/stop state — documented in DEPLOYMENT.md as a known scaling limit,
not silently glossed over.
"""
from __future__ import annotations

import threading
import time


class LiveMonitorState:
    def __init__(self):
        self._lock = threading.Lock()
        self.is_running: bool = False
        self.is_paused: bool = False
        self.detection_enabled: bool = True
        self.camera_index: int = 0
        self.started_at: float | None = None
        self.stats: dict = {
            "people_count": 0,
            "vehicle_count": 0,
            "object_count": 0,
            "risk_level": "LOW",
            "fps": 0.0,
            "latency_ms": 0.0,
            "frame_time": None,
            "camera_status": "unknown",       # unknown | connected | unavailable | error
            "connection_status": "disconnected",  # disconnected | connecting | connected | error
        }

    def start(self) -> None:
        with self._lock:
            self.is_running = True
            self.is_paused = False
            self.started_at = time.time()
            self.stats["connection_status"] = "connecting"

    def stop(self) -> None:
        with self._lock:
            self.is_running = False
            self.is_paused = False
            self.started_at = None
            self.stats["connection_status"] = "disconnected"
            self.stats["camera_status"] = "unknown"
            self.stats["fps"] = 0.0

    def pause(self) -> None:
        with self._lock:
            if self.is_running:
                self.is_paused = True

    def resume(self) -> None:
        with self._lock:
            if self.is_running:
                self.is_paused = False

    def restart(self) -> None:
        self.stop()
        self.start()

    def toggle_detection(self) -> bool:
        with self._lock:
            self.detection_enabled = not self.detection_enabled
            return self.detection_enabled

    def update_stats(self, **kwargs) -> None:
        with self._lock:
            self.stats.update(kwargs)

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "is_running": self.is_running,
                "is_paused": self.is_paused,
                "detection_enabled": self.detection_enabled,
                "started_at": self.started_at,
                **self.stats,
            }


# Single shared instance for the whole process — imported by the /stream
# router and by stream_processor.py's caller.
live_state = LiveMonitorState()
