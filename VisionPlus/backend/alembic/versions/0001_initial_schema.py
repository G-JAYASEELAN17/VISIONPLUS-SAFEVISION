"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-05

Hand-written to match app/models/*.py exactly (users, cameras, videos,
detections, alerts, reports, events, zone_analytics, chat_messages).
Run `alembic upgrade head` against DATABASE_URL to create these tables
instead of relying on Base.metadata.create_all() in app/main.py.
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("full_name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(120), nullable=False, unique=True, index=True),
        sa.Column("password", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), server_default="user"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "cameras",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("camera_name", sa.String(100), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("stream_url", sa.String(500), nullable=False),
        sa.Column("status", sa.String(20), server_default="Active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "videos",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("filepath", sa.String(500), nullable=False),
        sa.Column("status", sa.String(50), server_default="Uploaded"),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "detections",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("video_id", sa.Integer, nullable=False, index=True),
        sa.Column("frame_number", sa.Integer, nullable=False),
        sa.Column("people_count", sa.Integer),
        sa.Column("confidence", sa.Float),
        sa.Column("risk_level", sa.String(20)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("video_id", sa.Integer, nullable=False, index=True),
        sa.Column("frame_number", sa.Integer),
        sa.Column("people_count", sa.Integer),
        sa.Column("risk_level", sa.String(20)),
        sa.Column("message", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "reports",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("video_id", sa.Integer, nullable=False, index=True),
        sa.Column("total_frames", sa.Integer),
        sa.Column("maximum_people", sa.Integer),
        sa.Column("average_people", sa.Float),
        sa.Column("highest_risk", sa.String(20)),
        sa.Column("processing_time", sa.Float),
        sa.Column("output_video", sa.String),
        sa.Column("entry_count", sa.Integer, server_default="0"),
        sa.Column("exit_count", sa.Integer, server_default="0"),
        sa.Column("ai_summary", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "events",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("video_id", sa.Integer, nullable=False, index=True),
        sa.Column("frame_number", sa.Integer),
        sa.Column("event_type", sa.String(100)),
        sa.Column("severity", sa.String(20)),
        sa.Column("description", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "zone_analytics",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("video_id", sa.Integer, nullable=False, index=True),
        sa.Column("frame_number", sa.Integer, nullable=False),
        sa.Column("zone_a", sa.Integer, server_default="0"),
        sa.Column("zone_b", sa.Integer, server_default="0"),
        sa.Column("zone_c", sa.Integer, server_default="0"),
        sa.Column("zone_d", sa.Integer, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("zone_analytics")
    op.drop_table("events")
    op.drop_table("reports")
    op.drop_table("alerts")
    op.drop_table("detections")
    op.drop_table("videos")
    op.drop_table("cameras")
    op.drop_table("users")
