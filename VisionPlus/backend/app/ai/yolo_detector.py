"""
Bug fixed: original hardcoded "ai_models/yolo11n.pt" as a relative path,
which breaks if uvicorn is started from a different working directory.
Now resolved via settings so it always points to the right file.

Also lazy-loaded so import time is fast and tests can mock it.
"""
from __future__ import annotations

_model = None


def _get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        from app.core.config import settings
        _model = YOLO(settings.get_model_path())
    return _model


def detect(frame, classes: list[int] | None = None):
    """Run YOLO detection on a frame. classes=[0] filters for 'person' only."""
    model = _get_model()
    kwargs = {}
    if classes is not None:
        kwargs["classes"] = classes
    return model(frame, verbose=False, **kwargs)
