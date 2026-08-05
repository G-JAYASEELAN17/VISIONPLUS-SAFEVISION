import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Make "app.*" importable when alembic is run from the backend/ project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings  # noqa: E402
from app.db.database import Base  # noqa: E402

# Import every model so Base.metadata is fully populated for autogenerate
from app.models.user import User  # noqa: F401,E402
from app.models.camera import Camera  # noqa: F401,E402
from app.models.video import Video  # noqa: F401,E402
from app.models.detection import Detection  # noqa: F401,E402
from app.models.alert import Alert  # noqa: F401,E402
from app.models.report import Report  # noqa: F401,E402
from app.models.event import Event  # noqa: F401,E402
from app.models.zone_analytics import ZoneAnalytics  # noqa: F401,E402
from app.models.chat_message import ChatMessage  # noqa: F401,E402
from app.models.notification import Notification  # noqa: F401,E402

config = context.config
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)
config.set_main_option("sqlalchemy.url", _db_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
