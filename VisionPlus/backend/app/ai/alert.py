def generate_alert(people: int) -> dict:
    """Generate an alert dict from person count.

    Bug fixed: original only had CRITICAL / WARNING / SAFE.
    Now aligned with the 4-level risk system used everywhere else.
    """
    if people >= 50:
        return {"status": "CRITICAL", "message": "Crowd is extremely dense — immediate action required"}
    elif people >= 25:
        return {"status": "HIGH", "message": "High crowd density detected"}
    elif people >= 10:
        return {"status": "MEDIUM", "message": "Moderate crowd density"}
    return {"status": "LOW", "message": "Crowd level normal"}
