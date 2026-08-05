"""Optional Grok AI summary for analysis reports."""


def generate_ai_report(
    video_name: str,
    max_people: int,
    avg_people: float,
    highest_risk: str,
    entry_count: int,
    exit_count: int,
    zone_summary: dict,
    max_vehicles: int = 0,
) -> str | None:
    from app.core.config import settings
    if not settings.grok_enabled():
        return _rule_based_summary(
            video_name, max_people, avg_people, highest_risk, entry_count, exit_count, zone_summary, max_vehicles
        )
    try:
        import httpx
        prompt = (
            f"Write a concise crowd analysis report for video '{video_name}':\n"
            f"- Max people in one frame: {max_people}\n"
            f"- Average people per frame: {avg_people:.1f}\n"
            f"- Max vehicles in one frame: {max_vehicles}\n"
            f"- Highest risk level: {highest_risk}\n"
            f"- People entered: {entry_count}, exited: {exit_count}\n"
            f"- Zone distribution: {zone_summary}\n"
            "2-3 sentences. Professional tone."
        )
        response = httpx.post(
            f"{settings.GROK_BASE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {settings.GROK_API_KEY}"},
            json={"model": settings.GROK_MODEL,
                  "messages": [{"role": "user", "content": prompt}]},
            timeout=20,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception:
        return _rule_based_summary(
            video_name, max_people, avg_people, highest_risk, entry_count, exit_count, zone_summary, max_vehicles
        )


def _rule_based_summary(
    video_name, max_people, avg_people, highest_risk, entry_count, exit_count, zone_summary, max_vehicles=0
) -> str:
    busiest = max(zone_summary, key=zone_summary.get) if zone_summary else "N/A"
    vehicle_clause = f" A peak of {max_vehicles} vehicles were also observed." if max_vehicles else ""
    return (
        f"Analysis of '{video_name}' recorded a peak of {max_people} people "
        f"with an average of {avg_people:.1f} per frame.{vehicle_clause} "
        f"The highest risk level reached was {highest_risk}. "
        f"{entry_count} entries and {exit_count} exits were counted; "
        f"the busiest zone was {busiest}."
    )
