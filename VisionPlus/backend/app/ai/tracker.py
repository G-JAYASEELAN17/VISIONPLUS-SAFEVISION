"""
Bug fixed: original had a module-level ByteTrack singleton.
This means tracker state (IDs) carried over between separate video analyses,
producing wrong person counts and corrupted tracking IDs.

Now: make_tracker() creates a fresh tracker per analysis session.
"""
import supervision as sv


def make_tracker() -> sv.ByteTrack:
    """Return a fresh ByteTrack instance for a new analysis session."""
    return sv.ByteTrack()


def track(results, tracker: sv.ByteTrack) -> sv.Detections:
    """Convert YOLO results to tracked Detections using the provided tracker."""
    detections = sv.Detections.from_ultralytics(results)
    return tracker.update_with_detections(detections)
