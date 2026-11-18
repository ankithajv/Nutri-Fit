from __future__ import annotations

from typing import Any
from db.models import FoodItem

def compute_single_nutrient(grams: float, per_100g: float | None) -> float | None:
    """Deterministic nutrient calculation. Missing values stay None (never zero)."""
    if per_100g is None:
        return None
    return round((grams * float(per_100g)) / 100.0, 2)

def calculate_nutrients(
    food: FoodItem,
    grams: float,
    sugar_free: bool = False,
    oil_free: bool = False
) -> dict[str, float | None]:
    """
    Calculate nutrients for a food item given total weight in grams.
    CRITICAL:
    1. Arithmetic strictly follows: nutrient = grams * per_100g / 100.
    2. Missing nutrients remain None (NULL), never 0.0.
    """
    kcal = compute_single_nutrient(grams, food.kcal_100g)
    protein = compute_single_nutrient(grams, food.protein_100g)
    carbs = compute_single_nutrient(grams, food.carbs_100g)
    fat = compute_single_nutrient(grams, food.fat_100g)
    fibre = compute_single_nutrient(grams, food.fibre_100g)
    sugar = compute_single_nutrient(grams, food.sugar_100g)
    sodium = compute_single_nutrient(grams, food.sodium_100g)

    # Handle sugar_free adjustment
    if sugar_free and sugar is not None and sugar > 0:
        sugar_reduction = sugar
        sugar = 0.0
        if kcal is not None:
            # 1 gram sugar = 4 kcal
            kcal = max(0.0, round(kcal - (sugar_reduction * 4.0), 2))

    # Handle oil_free adjustment
    if oil_free and fat is not None and fat > 0:
        # Reduce added fat (typically 50% or up to 5g per serving)
        fat_reduction = round(fat * 0.5, 2)
        fat = round(fat - fat_reduction, 2)
        if kcal is not None:
            # 1 gram fat = 9 kcal
            kcal = max(0.0, round(kcal - (fat_reduction * 9.0), 2))

    return {
        "grams": grams,
        "kcal": kcal,
        "protein": protein,
        "carbs": carbs,
        "fat": fat,
        "fibre": fibre,
        "sugar": sugar,
        "sodium": sodium,
    }

def aggregate_nutrients(items: list[dict[str, Any]]) -> dict[str, float | None]:
    """
    Sum nutrients across multiple items or entries.
    If a nutrient is None across all items, it remains None.
    """
    totals: dict[str, float | None] = {
        "grams": 0.0,
        "kcal": 0.0,
        "protein": 0.0,
        "carbs": 0.0,
        "fat": 0.0,
        "fibre": 0.0,
        "sugar": 0.0,
        "sodium": 0.0,
    }
    has_value = {k: False for k in totals.keys()}

    for item in items:
        for k in totals.keys():
            val = item.get(k)
            if val is not None:
                totals[k] = (totals[k] or 0.0) + float(val)
                has_value[k] = True

    for k, present in has_value.items():
        if not present:
            totals[k] = None
        else:
            totals[k] = round(totals[k], 2)

    return totals
