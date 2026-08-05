import cv2


def draw_heatmap(frame, zones: dict):
    """Overlay a transparent colored heatmap for each zone."""
    height, width = frame.shape[:2]
    mid_x, mid_y = width // 2, height // 2

    zone_rects = {
        "Zone A": (0,     0,     mid_x, mid_y),
        "Zone B": (mid_x, 0,     width, mid_y),
        "Zone C": (0,     mid_y, mid_x, height),
        "Zone D": (mid_x, mid_y, width, height),
    }

    overlay = frame.copy()
    for name, (x1, y1, x2, y2) in zone_rects.items():
        count = zones.get(name, 0)
        if   count < 5:  color = (0, 255, 0)
        elif count < 10: color = (0, 255, 255)
        elif count < 20: color = (0, 165, 255)
        else:            color = (0, 0, 255)
        cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)

    frame = cv2.addWeighted(overlay, 0.25, frame, 0.75, 0)

    for name, (x1, y1, x2, y2) in zone_rects.items():
        count = zones.get(name, 0)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 2)
        cv2.putText(frame, f"{name}: {count}", (x1 + 10, y1 + 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    return frame
