from __future__ import annotations

MEAL_SCORE_WEIGHTS = {
    'protein_adequacy': 25,   # % of score
    'fibre_score': 20,
    'sugar_penalty': -20,
    'sodium_penalty': -15,
    'macro_balance': 20,
    'junk_penalty': -30,
}

PROTEIN_MIN_PER_MEAL = 10.0  # grams for a good score
FIBRE_MIN_PER_MEAL = 3.0     # grams
SUGAR_MAX_PER_MEAL = 25.0    # grams
SODIUM_MAX_PER_MEAL = 600.0  # mg
JUNK_TAG = 'junk'

MIN_DAILY_CALORIES = 1200.0
MAX_DAILY_CALORIES = 4000.0

PROTEIN_MIN_PER_DAY = 50.0   # grams
FIBRE_MIN_PER_DAY = 25.0     # grams
SUGAR_MAX_PER_DAY = 50.0     # grams
SODIUM_MAX_PER_DAY = 2000.0  # mg
