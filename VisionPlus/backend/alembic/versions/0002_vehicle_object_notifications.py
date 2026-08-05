"""vehicle/object counts + notifications

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-05

Adds:
- detections.vehicle_count, detections.object_count
- reports.maximum_vehicles, reports.average_vehicles
- new notifications table (Notification Center backing store)

These support the vehicle/object detection and Notification Center
features added in this pass. Existing rows get 0/NULL defaults, which is
correct: historical detections genuinely only ever recorded people.
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("detections", sa.Column("vehicle_count", sa.Integer, server_default="0"))
    op.add_column("detections", sa.Column("object_count", sa.Integer, server_default="0"))

    op.add_column("reports", sa.Column("maximum_vehicles", sa.Integer, server_default="0"))
    op.add_column("reports", sa.Column("average_vehicles", sa.Float, server_default="0"))

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("title", sa.String(150), nullable=False),
        sa.Column("message", sa.String(500), nullable=False),
        sa.Column("level", sa.String(20), server_default="INFO"),
        sa.Column("video_id", sa.Integer, nullable=True, index=True),
        sa.Column("is_read", sa.Boolean, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_column("reports", "average_vehicles")
    op.drop_column("reports", "maximum_vehicles")
    op.drop_column("detections", "object_count")
    op.drop_column("detections", "vehicle_count")
