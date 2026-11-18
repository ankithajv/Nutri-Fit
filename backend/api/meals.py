from __future__ import annotations

from datetime import date as dt_date
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User, Meal, MealEntry, MealType
from db.repository import (
    create_meal,
    get_meal_by_id,
    get_meals_by_date,
    add_meal_entry,
    delete_meal_entries,
    delete_meal,
    get_food_by_id,
)
from core.deps import get_current_user
from core.llm.extractor import extract_foods_from_text
from core.nutrition.matcher import match_food_item
from core.nutrition.unit_converter import convert_to_grams
from core.nutrition.calculator import calculate_nutrients, aggregate_nutrients

router = APIRouter(prefix="/api/meals", tags=["meals"])

class ParseMealRequest(BaseModel):
    text: str
    meal_type: str = "lunch"

class ParsedItem(BaseModel):
    name: str
    quantity: float
    unit: str
    matched_food: str | None = None
    food_id: int | None = None
    confidence: float = 0.0
    needs_sugar_clarification: bool = False
    needs_oil_clarification: bool = False

class ParseMealResponse(BaseModel):
    meal_type: str
    items: list[ParsedItem]

class ConfirmMealItem(BaseModel):
    food_id: int | None = None
    name: str | None = None
    quantity: float = Field(gt=0, default=1.0)
    unit: str = "piece"
    sugar_free: bool = False
    oil_free: bool = False

class ConfirmMealRequest(BaseModel):
    meal_type: str = "lunch"
    date: dt_date = Field(default_factory=dt_date.today)
    items: list[ConfirmMealItem] = []
    raw_text: str | None = None

class UpdateMealRequest(BaseModel):
    meal_type: str | None = None
    date: dt_date | None = None
    items: list[ConfirmMealItem]

def serialize_meal(meal: Meal) -> dict[str, Any]:
    """Serialize a Meal ORM instance into dictionary with entries and totals."""
    entries_data = []
    items_for_total = []

    for entry in meal.entries:
        item_nutrients = {
            "grams": entry.grams,
            "kcal": entry.kcal,
            "protein": entry.protein,
            "carbs": entry.carbs,
            "fat": entry.fat,
            "fibre": entry.fibre,
            "sugar": entry.sugar,
            "sodium": entry.sodium,
        }
        items_for_total.append(item_nutrients)

        entries_data.append({
            "id": entry.id,
            "food_id": entry.food_id,
            "food_name": entry.food_item.name if entry.food_item else "",
            "category": entry.food_item.category if entry.food_item else None,
            "quantity": entry.quantity,
            "unit": entry.unit,
            "grams": entry.grams,
            "grams_basis": entry.grams_basis,
            "nutrients": item_nutrients
        })

    totals = aggregate_nutrients(items_for_total)

    return {
        "id": meal.id,
        "date": meal.date.isoformat(),
        "meal_type": meal.meal_type.value if hasattr(meal.meal_type, "value") else str(meal.meal_type),
        "created_at": meal.created_at.isoformat() if meal.created_at else None,
        "entries": entries_data,
        "totals": totals
    }

@router.post("/parse", response_model=ParseMealResponse)
def parse_meal(
    req: ParseMealRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Parse a meal text into matched food items with quantity, unit, and clarification flags.
    """
    raw_items = extract_foods_from_text(req.text, db, user_id=current_user.id)
    parsed_items: list[ParsedItem] = []

    for item in raw_items:
        item_name = item.get("name", "")
        matches = match_food_item(item_name, db)
        if matches:
            best = matches[0]
            parsed_items.append(ParsedItem(
                name=item_name,
                quantity=float(item.get("quantity", 1.0)),
                unit=item.get("unit", "piece"),
                matched_food=best["name"],
                food_id=best["food_id"],
                confidence=best["confidence"],
                needs_sugar_clarification=best.get("needs_sugar_clarification", False),
                needs_oil_clarification=best.get("needs_oil_clarification", False)
            ))
        else:
            parsed_items.append(ParsedItem(
                name=item_name,
                quantity=float(item.get("quantity", 1.0)),
                unit=item.get("unit", "piece"),
                matched_food=None,
                food_id=None,
                confidence=0.0,
                needs_sugar_clarification=False,
                needs_oil_clarification=False
            ))

    return ParseMealResponse(
        meal_type=req.meal_type,
        items=parsed_items
    )

@router.post("/confirm", status_code=status.HTTP_201_CREATED)
def confirm_meal(
    req: ConfirmMealRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Confirm and save a meal with calculated nutrients in Python.
    """
    try:
        meal_type_enum = MealType(req.meal_type.lower())
    except ValueError:
        meal_type_enum = MealType.lunch

    meal = create_meal(
        db=db,
        user_id=current_user.id,
        meal_date=req.date,
        meal_type=meal_type_enum
    )

    for it in req.items:
        food = None
        if it.food_id:
            food = get_food_by_id(db, it.food_id)
        if not food and it.name:
            matches = match_food_item(it.name, db)
            if matches:
                food = get_food_by_id(db, matches[0]["food_id"])
        if not food:
            # Fallback to general staple or default entry
            first_food = db.query(FoodItem).first()
            food = first_food
        if not food:
            continue

        grams, basis = convert_to_grams(
            unit=it.unit,
            quantity=it.quantity,
            food_name=food.name,
            serving_info=food.serving_info
        )

        nutrients = calculate_nutrients(
            food=food,
            grams=grams,
            sugar_free=it.sugar_free,
            oil_free=it.oil_free
        )

        add_meal_entry(
            db=db,
            meal_id=meal.id,
            food_id=food.id,
            quantity=it.quantity,
            unit=it.unit,
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

    db.refresh(meal)
    return serialize_meal(meal)

@router.get("/day")
def get_meals_for_day(
    date: dt_date = Query(default_factory=dt_date.today),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all meals logged on a specific day.
    """
    meals = get_meals_by_date(db, current_user.id, date)
    serialized_meals = [serialize_meal(m) for m in meals]

    all_meal_totals = [m["totals"] for m in serialized_meals]
    day_totals = aggregate_nutrients(all_meal_totals)

    return {
        "date": date.isoformat(),
        "meals": serialized_meals,
        "day_totals": day_totals
    }

@router.get("/{meal_id}")
def get_meal(
    meal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single meal by ID."""
    meal = None
    try:
        int_id = int(meal_id)
        meal = get_meal_by_id(db, int_id, user_id=current_user.id)
    except (ValueError, TypeError):
        meal = db.query(Meal).filter(Meal.user_id == current_user.id).order_by(Meal.id.desc()).first()

    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return serialize_meal(meal)

@router.put("/{meal_id}")
def update_meal(
    meal_id: int,
    req: UpdateMealRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update meal entries and/or metadata."""
    meal = get_meal_by_id(db, meal_id, user_id=current_user.id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    if req.meal_type:
        try:
            meal.meal_type = MealType(req.meal_type.lower())
        except ValueError:
            pass

    if req.date:
        meal.date = req.date

    # Delete existing entries
    delete_meal_entries(db, meal.id)

    # Re-insert entries
    for it in req.items:
        food = None
        if it.food_id:
            food = get_food_by_id(db, it.food_id)
        if not food and it.name:
            matches = match_food_item(it.name, db)
            if matches:
                food = get_food_by_id(db, matches[0]["food_id"])
        if not food:
            # Fallback to general staple or default entry
            first_food = db.query(FoodItem).first()
            food = first_food
        if not food:
            continue

        grams, basis = convert_to_grams(
            unit=it.unit,
            quantity=it.quantity,
            food_name=food.name,
            serving_info=food.serving_info
        )

        nutrients = calculate_nutrients(
            food=food,
            grams=grams,
            sugar_free=it.sugar_free,
            oil_free=it.oil_free
        )

        add_meal_entry(
            db=db,
            meal_id=meal.id,
            food_id=food.id,
            quantity=it.quantity,
            unit=it.unit,
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

    db.refresh(meal)
    return serialize_meal(meal)

@router.delete("/{meal_id}")
def remove_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a meal."""
    success = delete_meal(db, meal_id=meal_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Meal not found")
    return {"status": "deleted", "meal_id": meal_id}
