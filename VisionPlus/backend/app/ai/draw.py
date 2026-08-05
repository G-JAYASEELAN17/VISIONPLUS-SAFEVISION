"""
Bug fixed: original had TWO identical draw modules — draw.py and visualizer.py.
Consolidated here. visualizer.py is removed.
Also: original crashed when tracker_id was None (new detections with no ID yet).

Extended: labels now include the detected class name (person/car/etc.) now
that detection covers more than just "person" — see detection_classes.py.
"""
import supervision as sv

from app.ai.detection_classes import COCO_CLASS_NAMES

_box_annotator = sv.BoxAnnotator()
_label_annotator = sv.LabelAnnotator()


def draw(frame, tracked: sv.Detections):
    labels = []
    if tracked.tracker_id is not None:
        class_ids = tracked.class_id if tracked.class_id is not None else [None] * len(tracked.tracker_id)
        for tid, cid in zip(tracked.tracker_id, class_ids):
            name = COCO_CLASS_NAMES.get(int(cid), "object") if cid is not None else "object"
            labels.append(f"{name} #{tid}")

    annotated = _box_annotator.annotate(scene=frame.copy(), detections=tracked)
    annotated = _label_annotator.annotate(scene=annotated, detections=tracked, labels=labels)
    return annotated
