"""
Smart chatbot that queries the live database to answer questions.
If GROK_API_KEY is a valid xAI key, it calls Grok with DB context.
Otherwise a fast rule-based responder handles common questions.
"""
from __future__ import annotations

import re
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.models.detection import Detection
from app.models.alert import Alert
from app.models.video import Video
from app.models.camera import Camera
from app.models.report import Report


# ── DB context helpers ────────────────────────────────────────────────────────

def _get_system_context(db: Session) -> dict:
    total_people = db.query(func.sum(Detection.people_count)).scalar() or 0
    total_videos = db.query(Video).count()
    total_cameras = db.query(Camera).count()
    total_alerts = db.query(Alert).count()

    risk_dist = {
        lvl: db.query(Detection).filter(Detection.risk_level == lvl).count()
        for lvl in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    }

    latest_report = db.query(Report).order_by(Report.created_at.desc()).first()
    recent_alerts = (
        db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()
    )

    return {
        "total_people": total_people,
        "total_videos": total_videos,
        "total_cameras": total_cameras,
        "total_alerts": total_alerts,
        "risk_distribution": risk_dist,
        "latest_report": latest_report,
        "recent_alerts": recent_alerts,
    }


# ── Rule-based responder ──────────────────────────────────────────────────────

def _rule_based_answer(question: str, ctx: dict) -> str:
    q = question.lower()
    rd = ctx["risk_distribution"]

    if re.search(r"\btotal.*(people|person|crowd|detect)", q):
        return (
            f"Vision+ has detected a total of **{ctx['total_people']:,} people** "
            f"across all analyzed videos."
        )

    if re.search(r"\b(camera|cam)\b", q) and re.search(r"\bhow many|count|total\b", q):
        return f"There are currently **{ctx['total_cameras']} cameras** registered in the system."

    if re.search(r"\b(video|footage)\b", q) and re.search(r"\bhow many|count|total\b", q):
        return f"**{ctx['total_videos']} videos** have been uploaded and analyzed."

    if re.search(r"\balert\b", q):
        recent = ctx["recent_alerts"]
        if not recent:
            return "No alerts have been generated yet."
        lines = [f"• Frame {a.frame_number} — **{a.risk_level}** ({a.people_count} people)" for a in recent]
        return f"**{ctx['total_alerts']} total alerts**. Most recent:\n" + "\n".join(lines)

    if re.search(r"\brisk\b", q):
        return (
            f"Risk distribution across all detections:\n"
            f"• 🟢 LOW: {rd['LOW']}\n"
            f"• 🟡 MEDIUM: {rd['MEDIUM']}\n"
            f"• 🟠 HIGH: {rd['HIGH']}\n"
            f"• 🔴 CRITICAL: {rd['CRITICAL']}"
        )

    if re.search(r"\bcritical\b", q):
        return (
            f"**{rd['CRITICAL']} critical detections** recorded. "
            "Critical means 50+ people detected in a single frame."
        )

    if re.search(r"\b(report|summary)\b", q):
        r = ctx["latest_report"]
        if not r:
            return "No analysis reports available yet. Upload and analyze a video first."
        return (
            f"**Latest report** (Video #{r.video_id}):\n"
            f"• Max people: {r.maximum_people}\n"
            f"• Avg people: {round(r.average_people, 1)}\n"
            f"• Highest risk: {r.highest_risk}\n"
            f"• Processing time: {r.processing_time}s"
        )

    if re.search(r"\b(upload|analyze|how to|start)\b", q):
        return (
            "To analyze a video:\n"
            "1. Go to **Upload Video** and select your file\n"
            "2. Click **Analyze** on the uploaded video\n"
            "3. Check **Reports** for the full breakdown\n"
            "4. Use **Investigation** to review the frame-by-frame timeline"
        )

    if re.search(r"\b(zone|area|quadrant)\b", q):
        return (
            "Vision+ divides each frame into 4 zones:\n"
            "• **Zone A** — Top-left\n"
            "• **Zone B** — Top-right\n"
            "• **Zone C** — Bottom-left\n"
            "• **Zone D** — Bottom-right\n"
            "Zone density is tracked per frame and available in Analytics."
        )

    if re.search(r"\b(hello|hi|hey|help)\b", q):
        return (
            "Hi! I'm the Vision+ AI assistant. I can answer questions about:\n"
            "• 📊 Detection stats and risk levels\n"
            "• 📹 Videos and cameras\n"
            "• 🚨 Alerts and incidents\n"
            "• 📄 Reports and summaries\n"
            "What would you like to know?"
        )

    return (
        f"I currently track **{ctx['total_videos']} videos**, "
        f"**{ctx['total_cameras']} cameras**, and "
        f"**{ctx['total_people']:,} total detections**. "
        "Ask me about alerts, risk levels, reports, or how to use Vision+!"
    )


# ── Grok integration (optional) ───────────────────────────────────────────────

def _grok_answer(question: str, ctx: dict, history: list[ChatMessage]) -> str:
    import httpx
    from app.core.config import settings

    rd = ctx["risk_distribution"]
    system_prompt = (
        "You are Vision+, an AI assistant for a crowd monitoring platform. "
        "Answer questions using the following live data:\n"
        f"- Total people detected: {ctx['total_people']}\n"
        f"- Videos analyzed: {ctx['total_videos']}\n"
        f"- Cameras: {ctx['total_cameras']}\n"
        f"- Alerts: {ctx['total_alerts']}\n"
        f"- Risk distribution: LOW={rd['LOW']}, MEDIUM={rd['MEDIUM']}, "
        f"HIGH={rd['HIGH']}, CRITICAL={rd['CRITICAL']}\n"
        "Be concise, factual, and helpful. Use markdown formatting."
    )

    messages = [{"role": m.role, "content": m.content} for m in history[-10:]]
    messages.append({"role": "user", "content": question})

    response = httpx.post(
        f"{settings.GROK_BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {settings.GROK_API_KEY}"},
        json={"model": settings.GROK_MODEL, "messages": [
            {"role": "system", "content": system_prompt}, *messages
        ]},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


# ── Public interface ──────────────────────────────────────────────────────────

def answer_question(db: Session, user_id: int, question: str) -> dict:
    """Answer a question and persist the exchange to chat history."""
    from app.core.config import settings

    ctx = _get_system_context(db)

    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(20)
        .all()
    )[::-1]

    if settings.grok_enabled():
        try:
            answer = _grok_answer(question, ctx, history)
        except Exception as exc:
            answer = f"Grok unavailable ({exc}). Falling back to built-in assistant.\n\n" + _rule_based_answer(question, ctx)
    else:
        answer = _rule_based_answer(question, ctx)

    # Persist exchange
    db.add(ChatMessage(user_id=user_id, role="user", content=question))
    db.add(ChatMessage(user_id=user_id, role="assistant", content=answer))
    db.commit()

    return {"answer": answer}
