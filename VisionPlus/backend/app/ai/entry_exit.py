"""
Bug fixed: original used module-level globals (counted_ids, entry_count, exit_count)
that were NEVER reset between analyses, causing cumulative wrong counts.

Now: EntryExitCounter class — instantiate one per video analysis.
"""
import cv2


class EntryExitCounter:
    def __init__(self):
        self._counted: set = set()
        self.entry_count: int = 0
        self.exit_count: int = 0

    def count(self, tracked, frame):
        """Draw dividing line and count entries/exits. Returns annotated frame."""
        height, width = frame.shape[:2]
        line_y = height // 2

        cv2.line(frame, (0, line_y), (width, line_y), (255, 0, 0), 2)

        if tracked.tracker_id is None:
            return frame

        for i, tid in enumerate(tracked.tracker_id):
            if tid in self._counted:
                continue
            x1, y1, x2, y2 = tracked.xyxy[i]
            center_y = int((y1 + y2) / 2)
            if center_y > line_y:
                self.entry_count += 1
            else:
                self.exit_count += 1
            self._counted.add(tid)

        return frame
