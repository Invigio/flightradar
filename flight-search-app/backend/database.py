"""
Database configuration
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Prefer DATABASE_URL from env; for dev fall back to a lightweight sqlite
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Local sqlite fallback – convenient for dev without Postgres
    DATABASE_URL = f"sqlite:///./flightdb.sqlite"

# For SQLite, need check_same_thread to avoid threading issues
connect_args = {}
if DATABASE_URL.startswith('sqlite'):
    connect_args = {"connect_args": {"check_same_thread": False}}

engine = create_engine(DATABASE_URL, **(connect_args or {}))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency dla FastAPI - zwraca sesję bazy danych"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
