from __future__ import annotations

import sys
from pathlib import Path

backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

logger = logging.getLogger("nutrifit.db")

def create_database_if_not_exists():
    """Ensure nutriai database exists on the MySQL server if using MySQL."""
    try:
        import pymysql
        conn = pymysql.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            port=settings.DB_PORT,
            charset="utf8mb4"
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        conn.commit()
        conn.close()
        logger.info(f"Database '{settings.DB_NAME}' ensured on MySQL server.")
    except Exception as e:
        logger.warning(f"Could not automatically create MySQL database '{settings.DB_NAME}': {e}")

# Attempt to ensure database exists
create_database_if_not_exists()

# Initialize SQLAlchemy engine
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )
    # Test connection
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info("Successfully connected to MySQL database.")
except Exception as e:
    logger.error(f"Failed to connect to MySQL database at {settings.DATABASE_URL}: {e}")
    logger.warning("Falling back to local SQLite database 'nutriai.db' for development stability.")
    engine = create_engine(
        "sqlite:///./nutriai.db",
        connect_args={"check_same_thread": False},
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
