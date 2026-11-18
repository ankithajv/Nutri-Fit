from __future__ import annotations

import csv
import logging
from typing import Any
from config import DATA_DIR

logger = logging.getLogger("nutrifit.converter")

# In-memory storage for unit conversions
_CONVERSIONS: list[dict[str, Any]] = []

def load_conversions() -> list[dict[str, Any]]:
    global _CONVERSIONS
    if _CONVERSIONS:
        return _CONVERSIONS

    csv_path = DATA_DIR / "unit_conversions.csv"
    if not csv_path.exists():
        logger.warning(f"unit_conversions.csv not found at {csv_path}")
        return []

    conversions = []
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            unit = row.get("unit", "").strip().lower()
            pattern = row.get("food_pattern", "").strip().lower()
            grams_str = row.get("grams", "").strip()
            try:
                grams = float(grams_str)
                conversions.append({
                    "unit": unit,
                    "food_pattern": pattern,
                    "grams": grams
                })
            except ValueError:
                continue

    _CONVERSIONS = conversions
    return _CONVERSIONS

# Default fallback weights if pattern not matched
DEFAULT_UNIT_WEIGHTS = {
    "cup": 240.0,
    "katori": 150.0,
    "bowl": 200.0,
    "plate": 250.0,
    "slice": 30.0,
    "tablespoon": 15.0,
    "teaspoon": 5.0,
    "glass": 240.0,
    "scoop": 75.0,
    "bar": 40.0,
    "packet": 35.0,
    "handful": 28.0,
    "piece": 50.0,
    "serving": 150.0,
}

def convert_to_grams(
    unit: str,
    quantity: float,
    food_name: str = "",
    serving_info: dict[str, Any] | None = None
) -> tuple[float, str]:
    """
    Convert food quantity and unit to grams.
    Returns (total_grams, basis_description).
    """
    clean_unit = unit.strip().lower()
    clean_name = food_name.strip().lower()

    # 1. Direct weight units
    if clean_unit in ("g", "gram", "grams", "gm", "gms"):
        return round(float(quantity), 2), "direct_gram"
    if clean_unit in ("kg", "kgs", "kilogram", "kilograms"):
        return round(float(quantity * 1000.0), 2), "direct_kg"
    if clean_unit in ("ml", "milliliter", "millilitre"):
        return round(float(quantity), 2), "volume_ml"
    if clean_unit in ("l", "liter", "litre", "liters", "litres"):
        return round(float(quantity * 1000.0), 2), "volume_liter"

    # 2. Check serving_info if available for piece/serving/portion
    if serving_info and isinstance(serving_info, dict):
        srv_g = serving_info.get("serving_size_g")
        if srv_g and clean_unit in ("piece", "serving", "portion", "plate"):
            try:
                g_per_unit = float(srv_g)
                return round(g_per_unit * quantity, 2), "serving_info_profile"
            except (ValueError, TypeError):
                pass

    # 3. Lookup in conversions table
    conversions = load_conversions()
    # First priority: matching both unit and food_pattern
    if clean_name:
        for entry in conversions:
            pat = entry["food_pattern"]
            if entry["unit"] == clean_unit and pat:
                if pat in clean_name or clean_name in pat:
                    return round(entry["grams"] * quantity, 2), f"rule_match_{pat}"

    # Second priority: unit match with empty pattern in conversions
    for entry in conversions:
        if entry["unit"] == clean_unit and not entry["food_pattern"]:
            return round(entry["grams"] * quantity, 2), f"unit_default_{clean_unit}"

    # 4. Fallback default unit dictionary
    if clean_unit in DEFAULT_UNIT_WEIGHTS:
        weight = DEFAULT_UNIT_WEIGHTS[clean_unit]
        return round(weight * quantity, 2), f"fallback_standard_{clean_unit}"

    # General fallback
    return round(50.0 * quantity, 2), "fallback_default_50g"
