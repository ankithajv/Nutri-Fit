from __future__ import annotations

import pytest
from core.scoring.health_score import calculate_meal_score, get_score_label

def test_score_labels():
    assert get_score_label(95.0) == "Great"
    assert get_score_label(85.0) == "Great"
    assert get_score_label(80.0) == "Good"
    assert get_score_label(70.0) == "Good"
    assert get_score_label(65.0) == "Okay"
    assert get_score_label(50.0) == "Okay"
    assert get_score_label(45.0) == "Needs balance"
    assert get_score_label(10.0) == "Needs balance"

def test_perfect_healthy_meal_score():
    # 500 kcal: 25g protein (100 kcal = 20%), 65g carbs (260 kcal = 52%), 15g fat (135 kcal = 27%)
    # fibre: 4g, sugar: 3g, sodium: 250mg, junk: 0
    res = calculate_meal_score(
        total_kcal=500.0,
        protein=25.0,  # >10g -> +25
        fibre=4.0,     # >3g -> +20
        sugar=3.0,     # 3/25 * 20 -> -2.4
        sodium=250.0,  # 250/600 * 15 -> -6.25
        carbs=65.0,    # 52%
        fat=15.0,      # 27% -> macro balance +10
        junk_calories=0.0
    )
    # 50 + 25 + 20 - 2.4 - 6.25 + 10 = 96.35 -> clamp 96.4
    assert res["score"] >= 85.0
    assert res["label"] == "Great"
    assert res["protein_score"] == 25.0
    assert res["fibre_score"] == 20.0
    assert res["macro_balance"] == 10.0

def test_junk_fried_meal_score():
    # 800 kcal: 100% junk samosas / fries, high sugar, high sodium
    res = calculate_meal_score(
        total_kcal=800.0,
        protein=4.0,   # 4/10 * 25 = 10
        fibre=1.0,     # 1/3 * 20 = 6.67
        sugar=30.0,    # >=25 -> -20
        sodium=800.0,  # >=600 -> -15
        carbs=120.0,
        fat=35.0,
        junk_calories=800.0 # 100% junk -> -30
    )
    # 50 + 10 + 6.7 - 20 - 15 + 0 - 30 = 1.7
    assert res["score"] < 50.0
    assert res["label"] == "Needs balance"
    assert res["junk_penalty"] == 30.0

def test_clamping_boundary():
    # Extremely negative penalties should clamp to 0.0
    res_low = calculate_meal_score(
        total_kcal=1000.0,
        protein=0.0,
        fibre=0.0,
        sugar=100.0,
        sodium=2000.0,
        carbs=200.0,
        fat=100.0,
        junk_calories=1000.0
    )
    assert res_low["score"] >= 0.0

    # Extremely positive should clamp to 100.0
    res_high = calculate_meal_score(
        total_kcal=400.0,
        protein=30.0,
        fibre=10.0,
        sugar=0.0,
        sodium=0.0,
        carbs=50.0,
        fat=12.0,
        junk_calories=0.0
    )
    # 50 + 25 + 20 - 0 - 0 + 10 = 105 -> clamped to 100
    assert res_high["score"] <= 100.0
