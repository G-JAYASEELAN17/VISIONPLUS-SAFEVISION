"""
Shared COCO class-id groupings used by BOTH the offline analysis pipeline
(analyze.py) and the live stream pipeline (stream_processor.py) so the two
classify detections identically.

yolo11n.pt (the model shipped in ai_models/) is trained on COCO-80, whose
class ids are fixed by the dataset, not configurable:
    0 = person
    1 = bicycle, 2 = car, 3 = motorcycle, 5 = bus, 6 = train, 7 = truck
    24 = backpack, 26 = handbag, 28 = suitcase

Previously the whole app only ever requested class 0 (person), so "vehicle"
and "object" counts did not exist anywhere in the system. This module adds
them without touching the detection/tracking machinery itself.
"""

PERSON_CLASSES = [0]
VEHICLE_CLASSES = [1, 2, 3, 5, 6, 7]  # bicycle, car, motorcycle, bus, train, truck
# Kept intentionally small and surveillance-relevant (unattended-item
# detection) rather than mapping all 80 COCO classes.
OBJECT_CLASSES = [24, 26, 28]  # backpack, handbag, suitcase

DETECT_CLASSES = PERSON_CLASSES + VEHICLE_CLASSES + OBJECT_CLASSES

COCO_CLASS_NAMES = {
    0: "person",
    1: "bicycle", 2: "car", 3: "motorcycle", 5: "bus", 6: "train", 7: "truck",
    24: "backpack", 26: "handbag", 28: "suitcase",
}

_PERSON_SET = set(PERSON_CLASSES)
_VEHICLE_SET = set(VEHICLE_CLASSES)
_OBJECT_SET = set(OBJECT_CLASSES)


def classify_counts(tracked) -> dict:
    """Given a supervision.Detections instance (with a .class_id array),
    return per-frame counts split by category. Never raises — returns all
    zeros if there's nothing tracked yet (e.g. first frame)."""
    class_ids = getattr(tracked, "class_id", None)
    if class_ids is None:
        return {"people": 0, "vehicles": 0, "objects": 0}

    people = vehicles = objects = 0
    for c in class_ids:
        c = int(c)
        if c in _PERSON_SET:
            people += 1
        elif c in _VEHICLE_SET:
            vehicles += 1
        elif c in _OBJECT_SET:
            objects += 1
    return {"people": people, "vehicles": vehicles, "objects": objects}
