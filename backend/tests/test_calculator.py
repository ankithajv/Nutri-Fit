from __future__ import annotations

import pytest
from db.models import FoodItem
from core.nutrition.calculator import (
    compute_single_nutrient,
    calculate_nutrients,
    aggregate_nutrients
)

def test_compute_single_nutrient():
    # 180 grams with 2.7g protein per 100g -> 180 * 2.7 / 100 = 4.86
    val = compute_single_nutrient(180.0, 2.7)
    assert val == 4.86

    # Missing value stays None (never zero)
    assert compute_single_nutrient(180.0, None) is None

def test_calculate_nutrients_basic():
    food = FoodItem(
        id=1,
        name="test food",
        kcal_100g=200.0,
        protein_100g=10.0,
        carbs_100g=20.0,
        fat_100g=5.0,
        fibre_100g=3.0,
        sugar_100g=4.0,
        sodium_100g=100.0
    )
    res = calculate_nutrients(food, 150.0)
    assert res["grams"] == 150.0
    assert res["kcal"] == 300.0       # 150 * 200 / 100
    assert res["protein"] == 15.0     # 150 * 10 / 100
    assert res["carbs"] == 30.0       # 150 * 20 / 100
    assert res["fat"] == 7.5          # 150 * 5 / 100
    assert res["fibre"] == 4.5        # 150 * 3 / 100
    assert res["sugar"] == 6.0        # 150 * 4 / 100
    assert res["sodium"] == 150.0     # 150 * 100 / 100

def test_calculate_nutrients_missing_values():
    food = FoodItem(
        id=2,
        name="food with nulls",
        kcal_100g=100.0,
        protein_100g=None,
        carbs_100g=None,
        fat_100g=2.0,
        fibre_100g=None,
        sugar_100g=None,
        sodium_100g=None
    )
    res = calculate_nutrients(food, 100.0)
    assert res["kcal"] == 100.0
    assert res["fat"] == 2.0
    # Strict rule: Missing nutrients stay NULL, never zero
    assert res["protein"] is None
    assert res["carbs"] is None
    assert res["fibre"] is None
    assert res["sugar"] is None
    assert res["sodium"] is None

def test_sugar_free_and_oil_free_adjustments():
    food = FoodItem(
        id=3,
        name="sweet oily item",
        kcal_100g=300.0,
        protein_100g=5.0,
        carbs_100g=40.0,
        fat_100g=10.0,
        fibre_100g=2.0,
        sugar_100g=20.0,
        sodium_100g=50.0
    )
    # 100g: original sugar=20g (80 kcal), fat=10g (90 kcal), kcal=300
    res_sugar_free = calculate_nutrients(food, 100.0, sugar_free=True)
    assert res_sugar_free["sugar"] == 0.0
    # Calories reduced by 20g * 4 = 80 -> 220 kcal
    assert res_sugar_free["kcal"] == 220.0

    res_oil_free = calculate_nutrients(food, 100.0, oil_free=True)
    # Fat reduced by 50% = 5g -> 5g
    assert res_oil_free["fat"] == 5.0
    # Calories reduced by 5g * 9 = 45 -> 255 kcal
    assert res_oil_free["kcal"] == 255.0

def test_aggregate_nutrients():
    entries = [
        {"kcal": 100.0, "protein": 10.0, "sugar": None},
        {"kcal": 150.0, "protein": 5.0, "sugar": 5.0},
    ]
    totals = aggregate_nutrients(entries)
    assert totals["kcal"] == 250.0
    assert totals["protein"] == 15.0
    assert totals["sugar"] == 5.0

    # If all items are None for a nutrient, it stays None
    all_none = [{"sugar": None}, {"sugar": None}]
    assert aggregate_nutrients(all_none)["sugar"] is None
