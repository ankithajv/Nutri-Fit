from __future__ import annotations

from core.scoring.rules import (
    MEAL_SCORE_WEIGHTS,
    PROTEIN_MIN_PER_MEAL,
    FIBRE_MIN_PER_MEAL,
    SUGAR_MAX_PER_MEAL,
    SODIUM_MAX_PER_MEAL,
    JUNK_TAG,
    MIN_DAILY_CALORIES,
    MAX_DAILY_CALORIES
)
from core.scoring.health_score import calculate_meal_score, calculate_day_score
from core.scoring.feedback import generate_meal_feedback, generate_day_feedback, generate_week_feedback

__all__ = [
    "MEAL_SCORE_WEIGHTS",
    "PROTEIN_MIN_PER_MEAL",
    "FIBRE_MIN_PER_MEAL",
    "SUGAR_MAX_PER_MEAL",
    "SODIUM_MAX_PER_MEAL",
    "JUNK_TAG",
    "MIN_DAILY_CALORIES",
    "MAX_DAILY_CALORIES",
    "calculate_meal_score",
    "calculate_day_score",
    "generate_meal_feedback",
    "generate_day_feedback",
    "generate_week_feedback",
]
