import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Database ─────────────────────────────────────────────────────────────
    # Default: SQLite (zero-config, works out of the box).
    # Switch to PostgreSQL by setting DATABASE_URL in .env:
    #   DATABASE_URL=postgresql://user:pass@localhost:5432/visionplus
    DATABASE_URL: str = "sqlite:///./visionplus.db"

    # ── JWT Authentication ────────────────────────────────────────────────────
    SECRET_KEY: str = "vision-plus-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # ── Development Mode ─────────────────────────────────────────────────────
    # When true, ALL authentication is bypassed: every request to a protected
    # endpoint is automatically treated as a demo administrator. This is for
    # local development / demos only.
    #
    # IMPORTANT: this does not delete or disable any auth code — it only
    # short-circuits app.core.deps.get_current_user. Set DEV_MODE=false (the
    # default) to re-enable real login/JWT enforcement with zero code changes.
    DEV_MODE: bool = False
    DEV_ADMIN_EMAIL: str = "demo.admin@visionplus.local"
    DEV_ADMIN_NAME: str = "Demo Administrator"

    # ── Grok AI (xAI) ────────────────────────────────────────────────────────
    # Leave empty to use the built-in rule-based chatbot.
    # Set to a real xAI key (starts with "xai-") to enable Grok responses.
    GROK_API_KEY: Optional[str] = None
    GROK_MODEL: str = "grok-3-mini"
    GROK_BASE_URL: str = "https://api.x.ai/v1"

    # ── YOLO Model ───────────────────────────────────────────────────────────
    # Absolute path resolved at runtime relative to project root
    MODEL_PATH: str = ""

    # ── Frontend CORS ────────────────────────────────────────────────────────
    CORS_ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # ── Analysis settings ────────────────────────────────────────────────────
    # Save a detection record every N frames (reduces DB writes dramatically)
    DETECTION_SAMPLE_EVERY: int = 5

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def get_model_path(self) -> str:
        if self.MODEL_PATH:
            return self.MODEL_PATH
        # Auto-resolve relative to where uvicorn is launched from
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        return os.path.join(project_root, "ai_models", "yolo11n.pt")

    def get_cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",") if o.strip()]

    def grok_enabled(self) -> bool:
        key = self.GROK_API_KEY or ""
        return key.startswith("xai-")


settings = Settings()
