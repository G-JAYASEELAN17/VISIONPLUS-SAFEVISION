def calculate_risk(people_count: int) -> str:
    """Return risk level string based on crowd size."""
    if people_count < 10:
        return "LOW"
    elif people_count < 25:
        return "MEDIUM"
    elif people_count < 50:
        return "HIGH"
    else:
        return "CRITICAL"
