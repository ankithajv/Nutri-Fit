from __future__ import annotations

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from db.database import engine, Base, SessionLocal
from db.seed import seed_food_items
from core.nutrition.matcher import load_aliases
from core.nutrition.unit_converter import load_conversions
from api.auth import router as auth_router
from api.meals import router as meals_router
from api.analysis import router as analysis_router
from api.profile import router as profile_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("nutrifit")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown."""
    logger.info("Initializing NutriFit Backend...")
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema validated.")

        # Seed initial foods if table empty
        with SessionLocal() as session:
            count = seed_food_items(session)
            logger.info(f"Food item catalog loaded with {count} items.")

        # Pre-cache aliases and unit conversions
        load_aliases()
        load_conversions()
        logger.info("Aliases and unit conversion tables pre-loaded.")
    except Exception as e:
        logger.error(f"Error during application startup: {e}", exc_info=True)

    yield

    logger.info("Shutting down NutriFit Backend.")

app = FastAPI(
    title="NutriFit Backend API",
    description="Intelligent Indian Nutrition Tracker & Health Analysis Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(meals_router)
app.include_router(analysis_router)
app.include_router(profile_router)

@app.get("/")
def root():
    return {
        "app": "NutriFit Backend API",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "db": "connected",
        "llm_provider": settings.LLM_PROVIDER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
