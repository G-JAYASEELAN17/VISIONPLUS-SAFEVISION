import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db.database import Base, engine
from app.core.config import settings

# Import all models so SQLAlchemy sees them before create_all
from app.models.user import User            # noqa: F401
from app.models.camera import Camera        # noqa: F401
from app.models.video import Video          # noqa: F401
from app.models.detection import Detection  # noqa: F401
from app.models.alert import Alert          # noqa: F401
from app.models.report import Report        # noqa: F401
from app.models.event import Event          # noqa: F401
from app.models.zone_analytics import ZoneAnalytics  # noqa: F401
from app.models.chat_message import ChatMessage      # noqa: F401
from app.models.notification import Notification     # noqa: F401

# Import all routers
from app.api.auth import router as auth_router
from app.api.camera import router as camera_router
from app.api.video import router as video_router
from app.api.analyze import router as analyze_router
from app.api.report import router as report_router
from app.api.dashboard import router as dashboard_router
from app.api.alert import router as alert_router
from app.api.analytics import router as analytics_router
from app.api.investigation import router as investigation_router
from app.api.events import router as event_router
from app.api.chatbot import router as chatbot_router
from app.api.live_stream import router as live_stream_router
from app.api.system import router as system_router
from app.api.notifications import router as notifications_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("visionplus")

# ── Create all tables ──────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)
logger.info("Database tables ensured.")

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Vision+",
    description="AI-powered crowd monitoring and analytics platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files ───────────────────────────────────────────────────────────────
os.makedirs("uploads/videos", exist_ok=True)
os.makedirs("reports", exist_ok=True)

app.mount("/media/uploads", StaticFiles(directory="uploads/videos"), name="uploads")
app.mount("/media/reports",  StaticFiles(directory="reports"),        name="reports")

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(camera_router)
app.include_router(video_router)
app.include_router(analyze_router)
app.include_router(report_router)
app.include_router(dashboard_router)
app.include_router(alert_router)
app.include_router(analytics_router)
app.include_router(investigation_router)
app.include_router(event_router)
app.include_router(chatbot_router)
app.include_router(live_stream_router)
app.include_router(system_router)
app.include_router(notifications_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Vision+ AI Backend is running",
        "version": "2.0.0",
        "docs": "/docs",
    }
