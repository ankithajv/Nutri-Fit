from __future__ import annotations

import logging
from typing import Any
from core.llm.client import call_llm_json
from core.scoring.health_score import get_score_label

logger = logging.getLogger("nutrifit.analyzer")

def analyze_meal_with_gemini(
    meal_type: str,
    entries: list[Any],
    totals: dict[str, float | None],
    daily_calorie_goal: int,
    baseline_score_details: dict[str, Any],
    junk_calories: float = 0.0
) -> dict[str, Any]:
    """
    Use Gemini Flash to perform comprehensive meal analysis,
    generating food-item health status, tags, feedback banner, and coach tip.
    Falls back gracefully to deterministic rule-based analysis if LLM is unavailable.
    """
    kcal = round(totals.get("kcal") or 0.0, 1)
    protein = round(totals.get("protein") or 0.0, 1)
    carbs = round(totals.get("carbs") or 0.0, 1)
    fat = round(totals.get("fat") or 0.0, 1)
    fibre = round(totals.get("fibre") or 0.0, 1)
    sugar = round(totals.get("sugar") or 0.0, 1)
    sodium = round(totals.get("sodium") or 0.0, 1)
    baseline_score = round(baseline_score_details.get("score", 70.0), 1)

    items_summary = []
    for entry in entries:
        name = getattr(entry, "food_name", None) or (entry.food_item.name if getattr(entry, "food_item", None) else "Food item")
        qty = getattr(entry, "quantity", 1)
        unit = getattr(entry, "unit", "serving")
        e_kcal = round(getattr(entry, "kcal", 0.0) or 0.0, 1)
        e_prot = round(getattr(entry, "protein", 0.0) or 0.0, 1)
        items_summary.append({
            "name": f"{name} ({qty} {unit})",
            "kcal": e_kcal,
            "protein": e_prot
        })

    system_prompt = (
        "You are NutriFit's expert Clinical Nutritionist and AI Diet Coach. "
        "Analyze the user's meal with precision. Evaluate diet quality, macro balance, "
        "and suggest practical, culturally relevant swaps. Respond with valid JSON only."
    )

    user_prompt = f"""
Meal Type: {meal_type}
Items: {items_summary}
Nutrient Totals:
- Calories: {kcal} kcal (Daily Target: {daily_calorie_goal} kcal)
- Protein: {protein}g
- Carbohydrates: {carbs}g
- Fat: {fat}g
- Dietary Fibre: {fibre}g
- Sugar: {sugar}g
- Sodium: {sodium}mg
- Junk/Fried Calories: {junk_calories} kcal
Baseline Score: {baseline_score}/100

Return a single JSON object with this EXACT structure:
{{
  "score": number between 0 and 100,
  "score_label": "Great" | "Good" | "Okay" | "Needs balance",
  "foods": [
    {{
      "name": string (food name and portion),
      "calories": number (calories in this item),
      "status": "green" | "amber" | "red",
      "reason": string (short reason explaining why it is green/amber/red)
    }}
  ],
  "chips": [string, string, string],
  "feedback": {{
    "type": "praise" | "warning",
    "message": string (1-2 sentences explaining nutritional balance of this meal),
    "swap_suggestion": string (specific actionable food swap or addition)
  }},
  "coach_tip": string (one concise actionable motivational sentence)
}}
"""

    llm_data = call_llm_json(user_prompt, system_prompt=system_prompt, max_tokens=1024)

    if isinstance(llm_data, dict) and "score" in llm_data and "feedback" in llm_data:
        try:
            score_val = float(llm_data.get("score", baseline_score))
            score_val = max(0.0, min(100.0, score_val))
            label_val = str(llm_data.get("score_label") or get_score_label(score_val))

            # Validate foods
            foods = []
            if isinstance(llm_data.get("foods"), list):
                for f in llm_data["foods"]:
                    if isinstance(f, dict) and "name" in f:
                        status = str(f.get("status", "green")).lower()
                        if status not in ("green", "amber", "red"):
                            status = "green"
                        foods.append({
                            "name": str(f["name"]),
                            "calories": round(float(f.get("calories", 0)), 1),
                            "status": status,
                            "reason": str(f.get("reason", ""))
                        })

            # If LLM didn't return foods list, build from entries
            if not foods:
                for it in items_summary:
                    foods.append({
                        "name": it["name"],
                        "calories": it["kcal"],
                        "status": "green" if it["kcal"] < 400 else "amber",
                        "reason": "Nutritional component"
                    })

            # Validate chips
            chips = []
            if isinstance(llm_data.get("chips"), list):
                chips = [str(c).strip() for c in llm_data["chips"] if c][:3]
            if not chips:
                if protein >= 15:
                    chips.append("High Protein")
                if fibre >= 4:
                    chips.append("Rich in Fibre")
                if sugar <= 5:
                    chips.append("Low Sugar")
                if not chips:
                    chips = ["Everyday Meal", "Balanced"]

            # Validate feedback
            raw_feedback = llm_data.get("feedback") or {}
            fb_type = str(raw_feedback.get("type", "praise" if score_val >= 70 else "warning")).lower()
            if fb_type not in ("praise", "warning"):
                fb_type = "praise" if score_val >= 70 else "warning"

            feedback = {
                "type": fb_type,
                "message": str(raw_feedback.get("message", "Balanced meal choice.")),
                "swap_suggestion": str(raw_feedback.get("swap_suggestion", ""))
            }

            coach_tip = str(llm_data.get("coach_tip") or "Stay consistent with whole foods and hydration!")

            return {
                "score": round(score_val, 1),
                "score_label": label_val,
                "foods": foods,
                "chips": chips,
                "feedback": feedback,
                "coach_tip": coach_tip
            }
        except Exception as e:
            logger.warning(f"Error parsing Gemini meal analysis, falling back: {e}")

    # Fallback deterministic analysis
    return fallback_meal_analysis(items_summary, totals, baseline_score, baseline_score_details.get("label", "Good"), junk_calories)

def fallback_meal_analysis(
    items_summary: list[dict[str, Any]],
    totals: dict[str, float | None],
    baseline_score: float,
    baseline_label: str,
    junk_calories: float
) -> dict[str, Any]:
    """Deterministic fallback when LLM is unavailable."""
    protein = totals.get("protein") or 0.0
    fibre = totals.get("fibre") or 0.0
    sugar = totals.get("sugar") or 0.0

    foods = []
    for it in items_summary:
        status = "green"
        reason = "Nutritious component"
        if it["kcal"] > 450:
            status = "amber"
            reason = "Calorie-dense portion"
        if junk_calories > 0 and it["kcal"] > 200:
            status = "red"
            reason = "Fried or refined ingredients"
        foods.append({
            "name": it["name"],
            "calories": it["kcal"],
            "status": status,
            "reason": reason
        })

    chips = []
    if protein >= 15:
        chips.append("High Protein")
    if fibre >= 4:
        chips.append("Rich in Fibre")
    if sugar <= 5 and protein >= 8:
        chips.append("Low Sugar")
    if junk_calories > 150:
        chips.append("Calorie Dense")
    chips = chips[:3] or ["Balanced Macros", "Everyday Fuel"]

    if baseline_score >= 80:
        feedback = {
            "type": "praise",
            "message": "Outstanding meal choice! Excellent nutrient density and balanced macronutrients.",
            "swap_suggestion": "Keep it up! Adding fresh seeds or greens enhances micronutrients further."
        }
    elif baseline_score >= 60:
        feedback = {
            "type": "praise",
            "message": "Solid meal. Moderate energy and consistent macronutrient breakdown.",
            "swap_suggestion": "Consider adding a serving of lentils or salad to increase fibre."
        }
    else:
        feedback = {
            "type": "warning",
            "message": "Needs balance: lower in protein/fibre and higher in refined energy.",
            "swap_suggestion": "Swap refined portions for whole grains, boiled eggs, or paneer."
        }

    return {
        "score": baseline_score,
        "score_label": baseline_label,
        "foods": foods,
        "chips": chips,
        "feedback": feedback,
        "coach_tip": "Pairing carbohydrates with high-fibre pulses prevents afternoon energy crashes."
    }

def analyze_day_with_gemini(
    date_str: str,
    totals: dict[str, float | None],
    calorie_goal: int,
    protein_goal: int,
    meals: list[dict[str, Any]],
    baseline_score: float,
    baseline_label: str
) -> dict[str, Any]:
    """Generate daily synthesis using Gemini Flash."""
    kcal = round(totals.get("kcal") or 0.0, 1)
    protein = round(totals.get("protein") or 0.0, 1)
    carbs = round(totals.get("carbs") or 0.0, 1)
    fat = round(totals.get("fat") or 0.0, 1)
    fibre = round(totals.get("fibre") or 0.0, 1)
    sugar = round(totals.get("sugar") or 0.0, 1)
    sodium = round(totals.get("sodium") or 0.0, 1)

    logged_meals = [m["meal_type"] for m in meals if m.get("logged")]

    system_prompt = (
        "You are NutriFit's expert Clinical Nutritionist. Analyze the user's full day of eating "
        "and provide evidence-based feedback on their energy, protein, fibre, and balance. Return valid JSON only."
    )

    user_prompt = f"""
Date: {date_str}
Meals Logged: {logged_meals}
Daily Nutrition:
- Consumed: {kcal} kcal / Target: {calorie_goal} kcal
- Protein: {protein}g / Goal: {protein_goal}g
- Carbs: {carbs}g
- Fats: {fat}g
- Fibre: {fibre}g (Target: 25g)
- Sugar: {sugar}g (Limit: 25g)
- Sodium: {sodium}mg (Limit: 2000mg)
Baseline Day Score: {baseline_score}/100

Return a single JSON object with this EXACT structure:
{{
  "banner": {{
    "type": "praise" | "warning",
    "message": string (encouraging 1-2 sentence overview of the day's nutritional balance)
  }},
  "checklist": {{
    "protein": {{ "pass": boolean, "note": string (note on protein status) }},
    "fibre": {{ "pass": boolean, "note": string (note on fibre status) }},
    "variety": {{ "pass": boolean, "note": string (note on meal diversity) }},
    "sugar": {{ "pass": boolean, "note": string (note on sugar threshold) }},
    "sodium": {{ "pass": boolean, "note": string (note on sodium threshold) }}
  }},
  "coach_tip": string (one concise actionable recommendation)
}}
"""

    llm_data = call_llm_json(user_prompt, system_prompt=system_prompt, max_tokens=1024)

    if isinstance(llm_data, dict) and "checklist" in llm_data:
        try:
            banner = llm_data.get("banner") or {}
            b_type = str(banner.get("type", "praise" if baseline_score >= 70 else "warning")).lower()
            if b_type not in ("praise", "warning"):
                b_type = "praise"

            raw_check = llm_data.get("checklist") or {}
            checklist = {}
            for k in ("protein", "fibre", "variety", "sugar", "sodium"):
                item = raw_check.get(k) or {}
                checklist[k] = {
                    "pass": bool(item.get("pass", True)),
                    "note": str(item.get("note", f"{k.capitalize()} monitored."))
                }

            return {
                "banner": {
                  "type": b_type,
                  "message": str(banner.get("message", "Solid day of nutrition alignment."))
                },
                "checklist": checklist,
                "coach_tip": str(llm_data.get("coach_tip", "Keep up your consistent daily habit!"))
            }
        except Exception as e:
            logger.warning(f"Error parsing Gemini day analysis: {e}")

    # Fallback checklist
    prot_pass = protein >= (protein_goal * 0.8)
    fib_pass = fibre >= 18.0
    sug_pass = sugar <= 30.0
    sod_pass = sodium <= 2300.0
    var_pass = len(logged_meals) >= 2

    return {
        "banner": {
            "type": "praise" if baseline_score >= 70 else "warning",
            "message": "Consistent nutrition alignment with your target budget today." if baseline_score >= 70 else "Room for balance: focus on lean proteins and fibre-rich foods tomorrow."
        },
        "checklist": {
            "protein": {"pass": prot_pass, "note": f"Reached {round((protein/max(1, protein_goal))*100)}% of your protein target"},
            "fibre": {"pass": fib_pass, "note": f"{fibre}g intake from vegetables and whole grains"},
            "variety": {"pass": var_pass, "note": f"Logged {len(logged_meals)} meal periods across the day"},
            "sugar": {"pass": sug_pass, "note": f"{sugar}g added sugar monitored"},
            "sodium": {"pass": sod_pass, "note": f"{sodium}mg sodium within daily guide"}
        },
        "coach_tip": "Stay hydrated and balance your upcoming meals with leafy greens and lean protein."
    }

def analyze_week_with_gemini(
    start_date: str,
    end_date: str,
    daily_calories: list[dict[str, Any]],
    macro_trends: list[dict[str, Any]],
    daily_scores: list[dict[str, Any]],
    stats: dict[str, Any]
) -> dict[str, Any]:
    """Generate weekly synthesis bullets and swap recommendations with Gemini Flash."""
    avg_score = stats.get("avg_score", 75)
    streak = stats.get("streak", 0)
    consistency_pct = stats.get("consistency_pct", 0)
    frequent_foods = [f.get("name") for f in stats.get("frequent_foods", [])]

    system_prompt = (
        "You are NutriFit's Senior Nutrition Strategist. Analyze the user's weekly nutrition data. "
        "Generate 3 personalized, evidence-based bullet insights ('Your Week, Decoded.') and tailored food swaps. Return valid JSON only."
    )

    user_prompt = f"""
Week: {start_date} to {end_date}
Logging Streak: {streak} days ({consistency_pct}% consistency)
Average Daily Score: {avg_score}/100
Frequent Foods: {frequent_foods}
Daily Calories: {daily_calories}
Macro Trends: {macro_trends}

Return a single JSON object with this EXACT structure:
{{
  "summary_bullets": [
    string (bullet 1: calorie consistency & energy balance),
    string (bullet 2: protein & macronutrient distribution),
    string (bullet 3: habit consistency and diet quality)
  ],
  "warning_card": {{
    "title": string (title for weekly focus area or null),
    "repeated_foods": [string, string],
    "swaps": [string, string]
  }}
}}
"""

    llm_data = call_llm_json(user_prompt, system_prompt=system_prompt, max_tokens=1024)

    if isinstance(llm_data, dict) and "summary_bullets" in llm_data:
        try:
            bullets = [str(b).strip() for b in llm_data["summary_bullets"] if b]
            if len(bullets) >= 2:
                warning = llm_data.get("warning_card")
                warning_card = None
                if isinstance(warning, dict) and warning.get("title"):
                    warning_card = {
                        "title": str(warning["title"]),
                        "repeated_foods": [str(x) for x in warning.get("repeated_foods", [])],
                        "swaps": [str(x) for x in warning.get("swaps", [])]
                    }
                return {
                    "summary_bullets": bullets[:3],
                    "warning_card": warning_card
                }
        except Exception as e:
            logger.warning(f"Error parsing Gemini weekly analysis: {e}")

    # Fallback bullets
    return {
        "summary_bullets": [
            f"Average daily calories aligned well with your target over {streak} active logging days.",
            "Protein consistency was maintained across major meal periods.",
            "Healthy habit streak is progressing strongly—continue prioritizing hydration and whole foods."
        ],
        "warning_card": {
            "title": "Maintain portion balance during evening meals",
            "repeated_foods": frequent_foods[:2] or ["White Rice", "Refined Snacks"],
            "swaps": [
                "Swap refined evening snacks for roasted makhana or chana",
                "Add a fresh bowl of salad prior to dinner to boost satiety"
            ]
        }
    }

