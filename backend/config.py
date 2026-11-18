from __future__ import annotations

import os
import urllib.parse
from pathlib import Path
from dotenv import load_dotenv

# Base directory for the backend
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Load .env file
load_dotenv(BASE_DIR / ".env")

class Settings:
    # Database settings
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "Apnaclg@123")
    DB_NAME: str = os.getenv("DB_NAME", "nutriai")
    _CUSTOM_DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    @property
    def DATABASE_URL(self) -> str:
        # If user provides a direct connection string (e.g. cloud MySQL on Aiven/TiDB)
        if self._CUSTOM_DATABASE_URL:
            # SQLAlchemy pymysql dialect formatting
            url = self._CUSTOM_DATABASE_URL
            if url.startswith("mysql://") and not url.startswith("mysql+pymysql://"):
                url = url.replace("mysql://", "mysql+pymysql://", 1)
            return url
        # Quote password to handle special characters like '@'
        safe_password = urllib.parse.quote_plus(self.DB_PASSWORD) if self.DB_PASSWORD else ""
        if safe_password:
            user_pass = f"{self.DB_USER}:{safe_password}"
        else:
            user_pass = self.DB_USER
        return f"mysql+pymysql://{user_pass}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # JWT Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nutrifit-super-secret-key-production-ready-2026-secure")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

    # LLM Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini" if (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")) else "gemini").lower()
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    LLM_DAILY_LIMIT: int = int(os.getenv("LLM_DAILY_LIMIT", "50"))
    MAX_INPUT_CHARS: int = int(os.getenv("MAX_INPUT_CHARS", "1000"))

    # Optional USDA
    USDA_API_KEY: str = os.getenv("USDA_API_KEY", "")

    # CORS origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

settings = Settings()
