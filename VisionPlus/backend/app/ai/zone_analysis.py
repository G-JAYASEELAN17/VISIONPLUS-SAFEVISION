def analyze_zones(tracked, width: int, height: int) -> dict:
    """Count people in each quadrant of the frame."""
    zones = {"Zone A": 0, "Zone B": 0, "Zone C": 0, "Zone D": 0}
    mid_x, mid_y = width // 2, height // 2

    for xyxy in tracked.xyxy:
        x1, y1, x2, y2 = xyxy
        cx = int((x1 + x2) / 2)
        cy = int((y1 + y2) / 2)

        if   cx < mid_x and cy < mid_y:  zones["Zone A"] += 1
        elif cx >= mid_x and cy < mid_y: zones["Zone B"] += 1
        elif cx < mid_x and cy >= mid_y: zones["Zone C"] += 1
        else:                             zones["Zone D"] += 1

    return zones
