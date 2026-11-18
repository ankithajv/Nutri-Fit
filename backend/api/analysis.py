from __future__ import annotations

from datetime import date as dt_date, timedelta
from typing import Any
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User, Meal
from db.repository import get_meal_by_id, get_meals_by_date, get_meals_by_range
from core.deps import get_current_user
from core.nutrition.calculator import aggregate_nutrients
from core.scoring.health_score import calculate_meal_score, calculate_day_score
from core.llm.analyzer import (
    analyze_meal_with_gemini,
    analyze_day_with_gemini,
    analyze_week_with_gemini
)

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

def extract_junk_calories(entries) -> float:
    """Calculate total calories contributed by items tagged as junk or fried."""
    junk_cals = 0.0
    for entry in entries:
        if entry.food_item and entry.food_item.tags:
            tags = entry.food_item.tags
            if isinstance(tags, list):
                if any(t in ("junk", "fried") for t in tags):
                    junk_cals += (entry.kcal or 0.0)
    return round(junk_cals, 2)

@router.get("/meal/{meal_id}")
def analyze_meal(
    meal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Detailed nutritional and health analysis of a single meal powered by Gemini Flash.
    """
    meal = None
    try:
        int_id = int(meal_id)
        meal = get_meal_by_id(db, int_id, user_id=current_user.id)
    except (ValueError, TypeError):
        # In case frontend passes a client-generated string id (e.g. meal_timestamp)
        meal = db.query(Meal).filter(Meal.user_id == current_user.id).order_by(Meal.id.desc()).first()

    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    items_nutrients = []
    for entry in meal.entries:
        items_nutrients.append({
            "grams": entry.grams,
            "kcal": entry.kcal,
            "protein": entry.protein,
            "carbs": entry.carbs,
            "fat": entry.fat,
            "fibre": entry.fibre,
            "sugar": entry.sugar,
            "sodium": entry.sodium,
        })

    totals = aggregate_nutrients(items_nutrients)
    junk_calories = extract_junk_calories(meal.entries)

    score_details = calculate_meal_score(
        total_kcal=totals.get("kcal") or 0.0,
        protein=totals.get("protein") or 0.0,
        fibre=totals.get("fibre") or 0.0,
        sugar=totals.get("sugar") or 0.0,
        sodium=totals.get("sodium") or 0.0,
        carbs=totals.get("carbs") or 0.0,
        fat=totals.get("fat") or 0.0,
        junk_calories=junk_calories
    )

    meal_type_str = meal.meal_type.value if hasattr(meal.meal_type, "value") else str(meal.meal_type)

    gemini_data = analyze_meal_with_gemini(
        meal_type=meal_type_str,
        entries=meal.entries,
        totals=totals,
        daily_calorie_goal=current_user.calorie_goal,
        baseline_score_details=score_details,
        junk_calories=junk_calories
    )

    final_score = gemini_data["score"]
    final_label = gemini_data["score_label"]

    score_details["score"] = final_score
    score_details["label"] = final_label

    feedback_obj = gemini_data["feedback"]

    return {
        "meal_id": str(meal.id),
        "date": meal.date.isoformat(),
        "meal_type": meal_type_str,
        "score": final_score,
        "score_label": final_label,
        "calories": round(totals.get("kcal") or 0.0, 1),
        "daily_calorie_goal": current_user.calorie_goal,
        "macros": {
            "protein": round(totals.get("protein") or 0.0, 1),
            "carbs": round(totals.get("carbs") or 0.0, 1),
            "fat": round(totals.get("fat") or 0.0, 1),
        },
        "nutrients": {
            "fibre": round(totals.get("fibre") or 0.0, 1),
            "sugar": round(totals.get("sugar") or 0.0, 1),
            "sodium": round(totals.get("sodium") or 0.0, 1),
        },
        "foods": gemini_data["foods"],
        "chips": gemini_data["chips"],
        "feedback": feedback_obj,
        "coach_tip": gemini_data["coach_tip"],
        # Backward compatibility for existing tests
        "totals": totals,
        "junk_calories": junk_calories,
        "score_details": score_details,
    }

@router.get("/day")
def analyze_day(
    date: dt_date = Query(default_factory=dt_date.today),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Comprehensive daily nutrition analysis against personal calorie & protein goals.
    """
    meals = get_meals_by_date(db, current_user.id, date)

    all_entries = []
    meals_summary = []
    for m in meals:
        m_items = []
        for e in m.entries:
            all_entries.append(e)
            m_items.append({
                "grams": e.grams,
                "kcal": e.kcal,
                "protein": e.protein,
                "carbs": e.carbs,
                "fat": e.fat,
                "fibre": e.fibre,
                "sugar": e.sugar,
                "sodium": e.sodium,
            })
        m_totals = aggregate_nutrients(m_items)
        meals_summary.append({
            "meal_id": m.id,
            "meal_type": m.meal_type.value if hasattr(m.meal_type, "value") else str(m.meal_type),
            "totals": m_totals,
            "logged": True
        })

    day_items_nutrients = [{
        "grams": e.grams,
        "kcal": e.kcal,
        "protein": e.protein,
        "carbs": e.carbs,
        "fat": e.fat,
        "fibre": e.fibre,
        "sugar": e.sugar,
        "sodium": e.sodium,
    } for e in all_entries]

    day_totals = aggregate_nutrients(day_items_nutrients)
    junk_calories = extract_junk_calories(all_entries)

    score_details = calculate_day_score(
        total_kcal=day_totals.get("kcal") or 0.0,
        protein=day_totals.get("protein") or 0.0,
        fibre=day_totals.get("fibre") or 0.0,
        sugar=day_totals.get("sugar") or 0.0,
        sodium=day_totals.get("sodium") or 0.0,
        carbs=day_totals.get("carbs") or 0.0,
        fat=day_totals.get("fat") or 0.0,
        junk_calories=junk_calories
    )

    gemini_day = analyze_day_with_gemini(
        date_str=date.isoformat(),
        totals=day_totals,
        calorie_goal=current_user.calorie_goal,
        protein_goal=current_user.protein_goal,
        meals=meals_summary,
        baseline_score=score_details["score"],
        baseline_label=score_details["label"]
    )

    total_kcal = round(day_totals.get("kcal") or 0.0, 1)
    total_prot = round(day_totals.get("protein") or 0.0, 1)
    goal_progress = {
        "calorie_goal": current_user.calorie_goal,
        "calorie_consumed": total_kcal,
        "calorie_remaining": max(0.0, current_user.calorie_goal - total_kcal),
        "calorie_pct": round((total_kcal / current_user.calorie_goal) * 100.0, 1) if current_user.calorie_goal else 0.0,
        "protein_goal": current_user.protein_goal,
        "protein_consumed": total_prot,
        "protein_remaining": max(0.0, current_user.protein_goal - total_prot),
        "protein_pct": round((total_prot / current_user.protein_goal) * 100.0, 1) if current_user.protein_goal else 0.0,
    }

    # 5 standard meal slots for frontend
    meal_type_order = ["breakfast", "brunch", "lunch", "snacks", "dinner"]
    formatted_meals = []
    for mt in meal_type_order:
        matching = [m for m in meals if (m.meal_type.value if hasattr(m.meal_type, "value") else str(m.meal_type)) == mt]
        if matching:
            first_m = matching[0]
            m_items = [{"kcal": e.kcal, "protein": e.protein} for e in first_m.entries]
            m_tot = aggregate_nutrients(m_items)
            formatted_meals.append({
                "meal_type": mt,
                "logged": True,
                "calories": round(m_tot.get("kcal") or 0.0, 1),
                "protein": round(m_tot.get("protein") or 0.0, 1),
                "meal_id": str(first_m.id)
            })
        else:
            formatted_meals.append({
                "meal_type": mt,
                "logged": False,
                "calories": 0.0,
                "protein": 0.0
            })

    return {
        "date": date.isoformat(),
        "score": score_details["score"],
        "score_label": score_details["label"],
        "total_calories": total_kcal,
        "calorie_goal": current_user.calorie_goal,
        "macros": {
            "protein": {
                "current": total_prot,
                "goal": current_user.protein_goal
            },
            "carbs": {
                "current": round(day_totals.get("carbs") or 0.0, 1),
                "goal": round((current_user.calorie_goal * 0.5) / 4)
            },
            "fat": {
                "current": round(day_totals.get("fat") or 0.0, 1),
                "goal": round((current_user.calorie_goal * 0.3) / 9)
            }
        },
        "meals": formatted_meals,
        "checklist": gemini_day["checklist"],
        "banner": gemini_day["banner"],
        "coach_tip": gemini_day.get("coach_tip", ""),
        # Backward compatibility for legacy tests
        "totals": day_totals,
        "junk_calories": junk_calories,
        "score_details": score_details,
        "goal_progress": goal_progress,
        "feedback": {
            "chips": [],
            "banner": gemini_day["banner"]
        }
    }

@router.get("/week")
def analyze_week(
    start_date: dt_date = Query(default_factory=lambda: dt_date.today() - timedelta(days=6)),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Weekly nutrition report covering a 7-day period with trends, badges, and Gemini Flash synthesis.
    """
    end_date = start_date + timedelta(days=6)
    meals = get_meals_by_range(db, current_user.id, start_date, end_date)

    # Group meals by date
    meals_by_date: dict[str, list] = {}
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for i in range(7):
        curr_d = (start_date + timedelta(days=i)).isoformat()
        meals_by_date[curr_d] = []

    for m in meals:
        d_str = m.date.isoformat()
        if d_str in meals_by_date:
            meals_by_date[d_str].append(m)

    daily_calories = []
    macro_trends = []
    daily_scores = []
    food_counter = Counter()

    total_days_logged = 0
    sum_score = 0.0
    sum_calories = 0.0
    sum_protein = 0.0
    sum_carbs = 0.0
    sum_fat = 0.0
    junk_days_count = 0

    daily_breakdown = []

    for i, (d_str, day_meals) in enumerate(meals_by_date.items()):
        d_obj = dt_date.fromisoformat(d_str)
        day_abbr = day_names[d_obj.weekday()]

        day_entries = []
        for m in day_meals:
            day_entries.extend(m.entries)
            for e in m.entries:
                if e.food_item and e.food_item.name:
                    food_counter[e.food_item.name] += 1

        if day_entries:
            total_days_logged += 1
            day_items = [{
                "grams": e.grams,
                "kcal": e.kcal,
                "protein": e.protein,
                "carbs": e.carbs,
                "fat": e.fat,
                "fibre": e.fibre,
                "sugar": e.sugar,
                "sodium": e.sodium,
            } for e in day_entries]

            totals = aggregate_nutrients(day_items)
            junk = extract_junk_calories(day_entries)
            if junk > 150:
                junk_days_count += 1

            score_data = calculate_day_score(
                total_kcal=totals.get("kcal") or 0.0,
                protein=totals.get("protein") or 0.0,
                fibre=totals.get("fibre") or 0.0,
                sugar=totals.get("sugar") or 0.0,
                sodium=totals.get("sodium") or 0.0,
                carbs=totals.get("carbs") or 0.0,
                fat=totals.get("fat") or 0.0,
                junk_calories=junk
            )

            d_score = score_data["score"]
            d_kcal = round(totals.get("kcal") or 0.0, 1)
            d_prot = round(totals.get("protein") or 0.0, 1)
            d_carbs = round(totals.get("carbs") or 0.0, 1)
            d_fat = round(totals.get("fat") or 0.0, 1)

            sum_score += d_score
            sum_calories += d_kcal
            sum_protein += d_prot
            sum_carbs += d_carbs
            sum_fat += d_fat

            daily_calories.append({
                "day": day_abbr,
                "date": d_str,
                "calories": d_kcal,
                "goal": current_user.calorie_goal
            })
            macro_trends.append({
                "day": day_abbr,
                "date": d_str,
                "protein": d_prot,
                "carbs": d_carbs,
                "fat": d_fat
            })
            daily_scores.append({
                "day": day_abbr,
                "date": d_str,
                "score": d_score
            })
            daily_breakdown.append({
                "date": d_str,
                "logged": True,
                "meal_count": len(day_meals),
                "totals": totals,
                "score": d_score,
                "label": score_data["label"]
            })
        else:
            daily_calories.append({
                "day": day_abbr,
                "date": d_str,
                "calories": 0.0,
                "goal": current_user.calorie_goal
            })
            macro_trends.append({
                "day": day_abbr,
                "date": d_str,
                "protein": 0.0,
                "carbs": 0.0,
                "fat": 0.0
            })
            daily_scores.append({
                "day": day_abbr,
                "date": d_str,
                "score": 0.0
            })
            daily_breakdown.append({
                "date": d_str,
                "logged": False,
                "meal_count": 0,
                "totals": aggregate_nutrients([]),
                "score": 0.0,
                "label": "No Data"
            })

    divisor = max(1, total_days_logged)
    avg_score = round(sum_score / divisor, 1) if total_days_logged > 0 else 0.0
    avg_calories = round(sum_calories / divisor, 1)
    avg_protein = round(sum_protein / divisor, 1)
    avg_carbs = round(sum_carbs / divisor, 1)
    avg_fat = round(sum_fat / divisor, 1)

    frequent_foods = [{"name": name, "count": count} for name, count in food_counter.most_common(5)]

    stats = {
        "streak": total_days_logged,
        "consistency_pct": round((total_days_logged / 7) * 100),
        "junk_days_count": junk_days_count,
        "frequent_foods": frequent_foods,
        "avg_score": avg_score
    }

    # Evaluate weekly badges
    badges = [
        {
            "id": "1",
            "title": "Consistent Logger",
            "description": "Logged all meals across the week",
            "earned": total_days_logged >= 5
        },
        {
            "id": "2",
            "title": "Protein Champion",
            "description": "Averaged target protein intake",
            "earned": avg_protein >= (current_user.protein_goal * 0.8)
        },
        {
            "id": "3",
            "title": "Balanced Energy",
            "description": "Daily calories remained within target threshold",
            "earned": total_days_logged > 0 and abs(avg_calories - current_user.calorie_goal) <= 300
        },
        {
            "id": "4",
            "title": "Whole Food Focus",
            "description": "Kept ultra-processed foods minimal",
            "earned": junk_days_count <= 1 and total_days_logged >= 3
        }
    ]

    gemini_week = analyze_week_with_gemini(
        start_date=start_date.isoformat(),
        end_date=end_date.isoformat(),
        daily_calories=daily_calories,
        macro_trends=macro_trends,
        daily_scores=daily_scores,
        stats=stats
    )

    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily_calories": daily_calories,
        "macro_trends": macro_trends,
        "daily_scores": daily_scores,
        "stats": stats,
        "badges": badges,
        "warning_card": gemini_week.get("warning_card"),
        "summary_bullets": gemini_week["summary_bullets"],
        # Backward-compatible fields
        "logged_days": total_days_logged,
        "daily_breakdown": daily_breakdown,
        "averages": {
            "score": avg_score,
            "kcal": avg_calories,
            "protein": avg_protein,
            "carbs": avg_carbs,
            "fat": avg_fat
        }
    }
