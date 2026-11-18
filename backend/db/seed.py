from __future__ import annotations

import sys
import os
from pathlib import Path

backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import csv
import json
import logging
from pathlib import Path
from sqlalchemy.orm import Session
from config import DATA_DIR
from db.models import FoodItem

logger = logging.getLogger("nutrifit.seed")

def safe_float(val: any) -> float | None:
    if val is None:
        return None
    s = str(val).strip()
    if not s or s.lower() in ("nan", "null", "none"):
        return None
    try:
        return float(s)
    except ValueError:
        return None

def seed_food_items(db: Session, force: bool = False) -> int:
    """Seed the food_items table from data/foods_indian_curated.csv if table is empty."""
    existing_count = db.query(FoodItem).count()
    if existing_count > 0 and not force:
        logger.info(f"food_items already seeded ({existing_count} items found). Skipping.")
        return existing_count

    csv_path = DATA_DIR / "foods_indian_curated.csv"
    if not csv_path.exists():
        logger.error(f"Cannot seed foods: file not found at {csv_path}")
        return 0

    if force and existing_count > 0:
        db.query(FoodItem).delete()
        db.commit()

    items = []
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_tags = row.get("tags", "[]")
            try:
                tags = json.loads(raw_tags)
            except Exception:
                tags = [t.strip() for t in raw_tags.split(",") if t.strip()]

            serving_size = safe_float(row.get("serving_size_g"))
            serving_desc = row.get("serving_description", "").strip() or None
            serving_info = {
                "serving_size_g": serving_size,
                "serving_description": serving_desc
            }

            food = FoodItem(
                id=int(row["id"]) if row.get("id") and row["id"].isdigit() else None,
                name=row["name"].strip().lower(),
                category=row.get("category", "").strip() or None,
                tags=tags,
                serving_info=serving_info,
                kcal_100g=safe_float(row.get("kcal_100g")),
                protein_100g=safe_float(row.get("protein_100g")),
                carbs_100g=safe_float(row.get("carbs_100g")),
                fat_100g=safe_float(row.get("fat_100g")),
                fibre_100g=safe_float(row.get("fibre_100g")),
                sugar_100g=safe_float(row.get("sugar_100g")),
                sodium_100g=safe_float(row.get("sodium_100g")),
                source=row.get("source", "curated_estimate").strip(),
                confidence=safe_float(row.get("confidence")) or 0.8
            )
            items.append(food)

    db.add_all(items)
    db.commit()
    logger.info(f"Successfully seeded {len(items)} food items into food_items.")
    return len(items)

if __name__ == "__main__":
    from db.database import SessionLocal, Base, engine
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_food_items(session, force=True)
