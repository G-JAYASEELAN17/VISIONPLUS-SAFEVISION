from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# Render (and Heroku) managed Postgres instances hand out DATABASE_URL with
# the legacy "postgres://" scheme, which SQLAlchemy 1.4+/2.x rejects
# outright ("Could not parse SQLAlchemy URL"). Normalize it here so setting
# DATABASE_URL straight from Render's dashboard just works.
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False; ignored by PostgreSQL
connect_args = {}
if _db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(_db_url, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
