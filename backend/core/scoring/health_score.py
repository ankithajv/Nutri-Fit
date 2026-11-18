from __future__ import annotations

from typing import Any
from core.scoring.rules import (
    PROTEIN_MIN_PER_MEAL,
    FIBRE_MIN_PER_MEAL,
    SUGAR_MAX_PER_MEAL,
    SODIUM_MAX_PER_MEAL,
    PROTEIN_MIN_PER_DAY,
    FIBRE_MIN_PER_DAY,
    SUGAR_MAX_PER_DAY,
    SODIUM_MAX_PER_DAY
)

def get_score_label(score: float) -> str:
    """Classify score into Great, Good, Okay, or Needs balance."""
    if score >= 85.0:
        return "Great"
    elif score >= 70.0:
        return "Good"
    elif score >= 50.0:
        return "Okay"
    else:
        return "Needs balance"

def compute_macro_percentages(kcal: float, protein: float, carbs: float, fat: float) -> dict[str, float]:
    """Calculate caloric contribution percentages for protein, carbs, and fat."""
    if not kcal or kcal <= 0:
        return {"protein_pct": 0.0, "carb_pct": 0.0, "fat_pct": 0.0}

    protein_cals = (protein or 0.0) * 4.0
    carb_cals = (carbs or 0.0) * 4.0
    fat_cals = (fat or 0.0) * 9.0

    return {
        "protein_pct": round((protein_cals / kcal) * 100.0, 1),
        "carb_pct": round((carb_cals / kcal) * 100.0, 1),
        "fat_pct": round((fat_cals / kcal) * 100.0, 1),
    }

def calculate_meal_score(
    total_kcal: float,
    protein: float,
    fibre: float,
    sugar: float,
    sodium: float,
    carbs: float,
    fat: float,
    junk_calories: float = 0.0
) -> dict[str, Any]:
    """
    Calculate health score for an individual meal.
    Formula:
      Score = 50 (base)
      + protein_score (0-25): min(protein / PROTEIN_MIN, 1) * 25
      + fibre_score (0-20): min(fibre / FIBRE_MIN, 1) * 20
      - sugar_penalty (0-20): min(sugar / SUGAR_MAX, 1) * 20
      - sodium_penalty (0-15): min(sodium / SODIUM_MAX, 1) * 15
      + macro_balance (0-10): 10 if 20 <= fat% <= 35 and 45 <= carb% <= 65 else 0
      - junk_penalty: 30 * (junk_calories / total_calories) if total > 0
    Clamped to [0, 100].
    """
    base = 50.0

    prot_val = max(0.0, protein or 0.0)
    fib_val = max(0.0, fibre or 0.0)
    sug_val = max(0.0, sugar or 0.0)
    sod_val = max(0.0, sodium or 0.0)

    protein_score = min(prot_val / PROTEIN_MIN_PER_MEAL, 1.0) * 25.0
    fibre_score = min(fib_val / FIBRE_MIN_PER_MEAL, 1.0) * 20.0
    sugar_penalty = min(sug_val / SUGAR_MAX_PER_MEAL, 1.0) * 20.0
    sodium_penalty = min(sod_val / SODIUM_MAX_PER_MEAL, 1.0) * 15.0

    macros = compute_macro_percentages(total_kcal, protein, carbs, fat)
    fat_pct = macros["fat_pct"]
    carb_pct = macros["carb_pct"]

    # Macro balance is 10 if fat is 20-35% and carbs are 45-65%
    macro_balance = 10.0 if (20.0 <= fat_pct <= 35.0 and 45.0 <= carb_pct <= 65.0) else 0.0

    junk_penalty = 0.0
    if total_kcal and total_kcal > 0 and junk_calories > 0:
        junk_ratio = min(junk_calories / total_kcal, 1.0)
        junk_penalty = 30.0 * junk_ratio

    raw_score = (
        base
        + protein_score
        + fibre_score
        - sugar_penalty
        - sodium_penalty
        + macro_balance
        - junk_penalty
    )

    final_score = round(max(0.0, min(100.0, raw_score)), 1)
    label = get_score_label(final_score)

    return {
        "score": final_score,
        "label": label,
        "base": base,
        "protein_score": round(protein_score, 1),
        "fibre_score": round(fibre_score, 1),
        "sugar_penalty": round(sugar_penalty, 1),
        "sodium_penalty": round(sodium_penalty, 1),
        "macro_balance": round(macro_balance, 1),
        "junk_penalty": round(junk_penalty, 1),
        "macros": macros
    }

def calculate_day_score(
    total_kcal: float,
    protein: float,
    fibre: float,
    sugar: float,
    sodium: float,
    carbs: float,
    fat: float,
    junk_calories: float = 0.0
) -> dict[str, Any]:
    """
    Calculate health score for a full day.
    Scales thresholds to full day targets.
    """
    base = 50.0

    prot_val = max(0.0, protein or 0.0)
    fib_val = max(0.0, fibre or 0.0)
    sug_val = max(0.0, sugar or 0.0)
    sod_val = max(0.0, sodium or 0.0)

    protein_score = min(prot_val / PROTEIN_MIN_PER_DAY, 1.0) * 25.0
    fibre_score = min(fib_val / FIBRE_MIN_PER_DAY, 1.0) * 20.0
    sugar_penalty = min(sug_val / SUGAR_MAX_PER_DAY, 1.0) * 20.0
    sodium_penalty = min(sod_val / SODIUM_MAX_PER_DAY, 1.0) * 15.0

    macros = compute_macro_percentages(total_kcal, protein, carbs, fat)
    fat_pct = macros["fat_pct"]
    carb_pct = macros["carb_pct"]

    macro_balance = 10.0 if (20.0 <= fat_pct <= 35.0 and 45.0 <= carb_pct <= 65.0) else 0.0

    junk_penalty = 0.0
    if total_kcal and total_kcal > 0 and junk_calories > 0:
        junk_ratio = min(junk_calories / total_kcal, 1.0)
        junk_penalty = 30.0 * junk_ratio

    raw_score = (
        base
        + protein_score
        + fibre_score
        - sugar_penalty
        - sodium_penalty
        + macro_balance
        - junk_penalty
    )

    final_score = round(max(0.0, min(100.0, raw_score)), 1)
    label = get_score_label(final_score)

    return {
        "score": final_score,
        "label": label,
        "base": base,
        "protein_score": round(protein_score, 1),
        "fibre_score": round(fibre_score, 1),
        "sugar_penalty": round(sugar_penalty, 1),
        "sodium_penalty": round(sodium_penalty, 1),
        "macro_balance": round(macro_balance, 1),
        "junk_penalty": round(junk_penalty, 1),
        "macros": macros
    }
