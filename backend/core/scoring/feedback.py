from __future__ import annotations

from typing import Any

def generate_meal_feedback(
    score_details: dict[str, Any],
    nutrients: dict[str, float | None],
    junk_calories: float = 0.0
) -> dict[str, Any]:
    """Generate chips and banner for an individual meal."""
    score = score_details.get("score", 50.0)
    prot = nutrients.get("protein") or 0.0
    fib = nutrients.get("fibre") or 0.0
    sug = nutrients.get("sugar") or 0.0
    sod = nutrients.get("sodium") or 0.0

    chips: list[dict[str, str]] = []

    if prot >= 15.0:
        chips.append({"label": "High Protein", "type": "positive"})
    if fib >= 4.0:
        chips.append({"label": "High Fibre", "type": "positive"})
    if score_details.get("macro_balance", 0) > 0:
        chips.append({"label": "Balanced Macros", "type": "positive"})
    if sug <= 5.0 and prot >= 8.0:
        chips.append({"label": "Low Sugar", "type": "positive"})

    if sug >= 20.0:
        chips.append({"label": "High Sugar", "type": "warning"})
    if sod >= 600.0:
        chips.append({"label": "High Sodium", "type": "warning"})
    if junk_calories >= 150.0:
        chips.append({"label": "Fried / Processed", "type": "warning"})

    # Limit to top 3 chips
    chips = chips[:3]

    # Banner message
    if score >= 80.0:
        banner = {
            "type": "praise",
            "message": "Outstanding meal choice! Excellent nutrient density and balanced macros.",
            "swap": "Keep it up! Adding fresh herbs or seeds can enhance micronutrient intake further."
        }
    elif score >= 60.0:
        if prot < 10.0:
            banner = {
                "type": "warning",
                "message": "Decent meal, but could use a stronger protein source for sustained satiety.",
                "swap": "Pair with a katori of dal, boiled egg, or 50g paneer."
            }
        elif fib < 3.0:
            banner = {
                "type": "warning",
                "message": "Fiber content is lower than ideal for this meal.",
                "swap": "Add a crisp cucumber/tomato salad or choose whole grain grains."
            }
        else:
            banner = {
                "type": "praise",
                "message": "Good everyday meal. Moderate energy and macro balance.",
                "swap": "Consider reducing added oils or dressings."
            }
    else:
        if sug >= 25.0:
            banner = {
                "type": "warning",
                "message": "High sugar load detected in this meal.",
                "swap": "Swap sugary desserts or drinks for fresh fruits like papaya or coconut water."
            }
        elif junk_calories >= 200.0:
            banner = {
                "type": "warning",
                "message": "Significant calories from fried or heavily processed items.",
                "swap": "Try air-fried, steamed (idli/dhokla), or grilled alternatives."
            }
        else:
            banner = {
                "type": "warning",
                "message": "Needs balance: low on protein/fibre and high in refined calories.",
                "swap": "Incorporate leafy greens, lentils, or sprouts."
            }

    return {
        "chips": chips,
        "banner": banner,
        "badges": []
    }

def generate_day_feedback(
    score_details: dict[str, Any],
    nutrients: dict[str, float | None],
    user_calorie_goal: int = 2000,
    user_protein_goal: int = 50
) -> dict[str, Any]:
    """Generate chips and banner for a full day analysis."""
    score = score_details.get("score", 50.0)
    kcal = nutrients.get("kcal") or 0.0
    prot = nutrients.get("protein") or 0.0
    fib = nutrients.get("fibre") or 0.0
    sug = nutrients.get("sugar") or 0.0

    chips: list[dict[str, str]] = []

    if prot >= user_protein_goal:
        chips.append({"label": "Protein Goal Met", "type": "positive"})
    if fib >= 25.0:
        chips.append({"label": "Fibre Target Reached", "type": "positive"})
    if abs(kcal - user_calorie_goal) <= 150:
        chips.append({"label": "Calorie Bullseye", "type": "positive"})
    if sug <= 30.0:
        chips.append({"label": "Controlled Sugar", "type": "positive"})

    if sug > 50.0:
        chips.append({"label": "Excess Sugar", "type": "warning"})
    if prot < (user_protein_goal * 0.7):
        chips.append({"label": "Protein Deficit", "type": "warning"})

    chips = chips[:3]

    if score >= 75.0:
        banner = {
            "type": "praise",
            "message": f"Superb daily nutrition! You achieved a score of {score}/100.",
            "swap": "You are on track with your wellness goals. Drink plenty of water."
        }
    else:
        banner = {
            "type": "warning",
            "message": f"Daily score is {score}/100. Room to optimize macro distribution.",
            "swap": "Plan tomorrow's meals around a solid protein anchor (eggs, paneer, lentils, tofu)."
        }

    return {
        "chips": chips,
        "banner": banner,
        "badges": []
    }

def generate_week_feedback(
    avg_score: float,
    avg_protein: float,
    avg_fibre: float,
    user_protein_goal: int,
    logged_days: int
) -> dict[str, Any]:
    """Generate weekly summary badges and banner."""
    badges: list[dict[str, str]] = []

    if logged_days >= 6:
        badges.append({"name": "Consistency Champion", "icon": "calendar-check", "desc": "Logged meals for 6+ days"})
    if avg_protein >= user_protein_goal:
        badges.append({"name": "Protein Master", "icon": "dumbbell", "desc": "Met average daily protein target"})
    if avg_fibre >= 22.0:
        badges.append({"name": "Gut Health Hero", "icon": "heart-pulse", "desc": "Averaged 22g+ fibre daily"})
    if avg_score >= 75.0:
        badges.append({"name": "NutriFit Elite", "icon": "award", "desc": "Maintained an average score of 75+"})

    banner = {
        "type": "praise" if avg_score >= 70.0 else "warning",
        "message": f"Weekly Average Health Score: {round(avg_score, 1)}/100 across {logged_days} active days.",
        "swap": "Consistency beats intensity. Keep logging and refining one meal at a time!"
    }

    return {
        "chips": [],
        "banner": banner,
        "badges": badges
    }
