from __future__ import annotations

import pytest
from core.llm.analyzer import (
    analyze_meal_with_gemini,
    analyze_day_with_gemini,
    analyze_week_with_gemini,
    fallback_meal_analysis
)
from core.llm.client import clean_json_string

def test_clean_json_string():
    raw_markdown = """```json
    {"score": 85, "score_label": "Great"}
    ```"""
    cleaned = clean_json_string(raw_markdown)
    assert cleaned == '{"score": 85, "score_label": "Great"}'

def test_fallback_meal_analysis_structure():
    items = [{"name": "Chapati (2 piece)", "kcal": 240, "protein": 6}]
    totals = {"kcal": 500, "protein": 22, "fibre": 5, "sugar": 3, "sodium": 400}
    res = fallback_meal_analysis(items, totals, 82.0, "Great", 0.0)

    assert "score" in res
    assert res["score_label"] == "Great"
    assert len(res["foods"]) == 1
    assert res["foods"][0]["status"] == "green"
    assert "chips" in res
    assert "feedback" in res
    assert "swap_suggestion" in res["feedback"]
    assert "coach_tip" in res

def test_analyze_day_structure():
    totals = {"kcal": 1600, "protein": 70, "fibre": 20, "sugar": 15, "sodium": 1500}
    res = analyze_day_with_gemini(
        date_str="2026-11-16",
        totals=totals,
        calorie_goal=2000,
        protein_goal=75,
        meals=[{"meal_type": "lunch", "logged": True}],
        baseline_score=80.0,
        baseline_label="Good"
    )
    assert "banner" in res
    assert "checklist" in res
    assert "protein" in res["checklist"]
    assert "fibre" in res["checklist"]
    assert "coach_tip" in res

def test_analyze_week_structure():
    daily_calories = [{"day": "Mon", "calories": 1800, "goal": 2000}]
    macro_trends = [{"day": "Mon", "protein": 75, "carbs": 210, "fat": 50}]
    daily_scores = [{"day": "Mon", "score": 85}]
    stats = {"streak": 5, "consistency_pct": 71, "avg_score": 82, "frequent_foods": []}

    res = analyze_week_with_gemini(
        start_date="2026-11-10",
        end_date="2026-11-16",
        daily_calories=daily_calories,
        macro_trends=macro_trends,
        daily_scores=daily_scores,
        stats=stats
    )
    assert "summary_bullets" in res
    assert len(res["summary_bullets"]) >= 2
    assert "warning_card" in res

