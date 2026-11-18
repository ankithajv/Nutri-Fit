from __future__ import annotations

import csv
from datetime import date as dt_date, timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from config import DATA_DIR
from db.database import get_db
from db.models import User, Meal, MealType
from db.repository import (
    update_user_profile,
    delete_user,
    get_food_by_name,
    create_meal,
    add_meal_entry,
)
from core.deps import get_current_user
from core.nutrition.unit_converter import convert_to_grams
from core.nutrition.calculator import calculate_nutrients
from core.nutrition.matcher import match_food_item

router = APIRouter(prefix="/api/profile", tags=["profile"])

class UpdateProfileRequest(BaseModel):
    name: str | None = None
    calorie_goal: int | None = Field(default=None, ge=1000, le=5000)
    protein_goal: int | None = Field(default=None, ge=20, le=300)

@router.put("")
def update_profile(
    req: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update profile goals and display name."""
    updated = update_user_profile(
        db=db,
        user_id=current_user.id,
        name=req.name,
        calorie_goal=req.calorie_goal,
        protein_goal=req.protein_goal
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": updated.id,
        "name": updated.name,
        "email": updated.email,
        "calorie_goal": updated.calorie_goal,
        "protein_goal": updated.protein_goal
    }

@router.post("/load-sample", status_code=status.HTTP_201_CREATED)
def load_sample_week(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Populate user's account with a full curated sample week of Indian meals.
    """
    csv_path = DATA_DIR / "sample_week.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=500, detail="Sample week data file missing")

    today = dt_date.today()
    # Map offsets 0..6 to past 6 days up to today
    start_date = today - timedelta(days=6)

    # Cache meals by (date, meal_type) to group items into the same meal
    meals_map: dict[tuple[dt_date, str], Meal] = {}
    entries_count = 0

    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            offset = int(row.get("day_offset", 0))
            meal_date = start_date + timedelta(days=offset)
            m_type_str = row.get("meal_type", "lunch").strip().lower()

            key = (meal_date, m_type_str)
            if key not in meals_map:
                try:
                    m_enum = MealType(m_type_str)
                except ValueError:
                    m_enum = MealType.lunch
                meal = create_meal(db, current_user.id, meal_date, m_enum)
                meals_map[key] = meal
            else:
                meal = meals_map[key]

            food_name = row.get("food_name", "").strip().lower()
            qty = float(row.get("quantity", 1.0))
            unit = row.get("unit", "piece").strip().lower()
            sugar_free = row.get("sugar_free", "false").lower() == "true"
            oil_free = row.get("oil_free", "false").lower() == "true"

            # Find food item
            food = get_food_by_name(db, food_name)
            if not food:
                matches = match_food_item(food_name, db)
                if matches:
                    food = matches[0]["food_item"]

            if not food:
                continue

            grams, basis = convert_to_grams(
                unit=unit,
                quantity=qty,
                food_name=food.name,
                serving_info=food.serving_info
            )

            nutrients = calculate_nutrients(
                food=food,
                grams=grams,
                sugar_free=sugar_free,
                oil_free=oil_free
            )

            add_meal_entry(
                db=db,
                meal_id=meal.id,
                food_id=food.id,
                quantity=qty,
                unit=unit,
                grams=grams,
                grams_basis=basis,
                kcal=nutrients["kcal"],
                protein=nutrients["protein"],
                carbs=nutrients["carbs"],
                fat=nutrients["fat"],
                fibre=nutrients["fibre"],
                sugar=nutrients["sugar"],
                sodium=nutrients["sodium"]
            )
            entries_count += 1

    return {
        "message": "Sample week data loaded successfully",
        "meals_created": len(meals_map),
        "entries_created": entries_count,
        "date_range": {
            "start": start_date.isoformat(),
            "end": today.isoformat()
        }
    }

@router.delete("")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permanently delete user profile and all associated logs."""
    success = delete_user(db, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "deleted", "message": "Account successfully removed"}
