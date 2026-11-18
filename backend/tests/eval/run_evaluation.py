from __future__ import annotations

import sys
import os
from pathlib import Path

backend_dir = str(Path(__file__).resolve().parent.parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import time
import json
from pathlib import Path
from core.nlp.rule_parser import parse_meal_text
from core.nutrition.unit_converter import convert_to_grams
from core.scoring.health_score import calculate_meal_score

BENCHMARK_CASES = [
    {
        "input": "2 idli, 1 bowl sambar, 1 cup coffee",
        "expected_count": 3,
        "expected_items": [
            {"name": "idli", "quantity": 2.0, "unit": "piece"},
            {"name": "sambar", "quantity": 1.0, "unit": "bowl"},
            {"name": "coffee", "quantity": 1.0, "unit": "cup"}
        ]
    },
    {
        "input": "half bowl curd, 2 chapatis and 1 1/2 glass buttermilk",
        "expected_count": 3,
        "expected_items": [
            {"name": "curd", "quantity": 0.5, "unit": "bowl"},
            {"name": "chapati", "quantity": 2.0, "unit": "piece"},
            {"name": "buttermilk", "quantity": 1.5, "unit": "glass"}
        ]
    },
    {
        "input": "1 plate chicken biryani + 1 can cola",
        "expected_count": 2,
        "expected_items": [
            {"name": "chicken biryani", "quantity": 1.0, "unit": "plate"},
            {"name": "cola", "quantity": 1.0, "unit": "can"}
        ]
    },
    {
        "input": "3 boiled eggs and 2 slices brown bread",
        "expected_count": 2,
        "expected_items": [
            {"name": "boiled egg", "quantity": 3.0, "unit": "piece"},
            {"name": "brown bread", "quantity": 2.0, "unit": "slice"}
        ]
    },
    {
        "input": "1 cup masala tea with 2 parle-g biscuits",
        "expected_count": 2,
        "expected_items": [
            {"name": "masala tea", "quantity": 1.0, "unit": "cup"},
            {"name": "parle-g biscuit", "quantity": 2.0, "unit": "piece"}
        ]
    }
]

def run_evaluation():
    print("=" * 60)
    print("RUNNING NUTRIFIT BACKEND BENCHMARK EVALUATION")
    print("=" * 60)

    # 1. Evaluate Rule Parser
    total_cases = len(BENCHMARK_CASES)
    passed_cases = 0
    total_tokens = 0
    start_time = time.perf_counter()

    for case in BENCHMARK_CASES:
        inp = case["input"]
        parsed = parse_meal_text(inp)
        if len(parsed) == case["expected_count"]:
            passed_cases += 1
        total_tokens += len(parsed)

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    avg_latency = round(elapsed_ms / total_cases, 2)
    parser_accuracy = round((passed_cases / total_cases) * 100.0, 1)

    print(f"Rule Parser Test Cases: {passed_cases}/{total_cases} passed ({parser_accuracy}%)")
    print(f"Average Parser Latency: {avg_latency} ms per input")

    # 2. Evaluate Unit Converter
    converter_tests = [
        ("piece", 2, "idli", 80.0),
        ("bowl", 1, "dal", 250.0),
        ("cup", 1, "cooked rice", 180.0),
        ("slice", 2, "bread", 60.0),
        ("tablespoon", 1, "ghee", 15.0),
        ("g", 150, "chicken", 150.0)
    ]
    conv_passed = 0
    for unit, qty, food, exp_g in converter_tests:
        g, _ = convert_to_grams(unit, qty, food)
        if abs(g - exp_g) < 0.1:
            conv_passed += 1

    conv_acc = round((conv_passed / len(converter_tests)) * 100.0, 1)
    print(f"Unit Converter Accuracy: {conv_passed}/{len(converter_tests)} ({conv_acc}%)")

    # 3. Evaluate Scoring Boundary Conditions
    healthy_score = calculate_meal_score(
        total_kcal=500, protein=25, fibre=5, sugar=2, sodium=300, carbs=60, fat=18, junk_calories=0
    )
    junk_score = calculate_meal_score(
        total_kcal=750, protein=5, fibre=1, sugar=28, sodium=850, carbs=110, fat=32, junk_calories=750
    )

    scoring_valid = (healthy_score["score"] >= 85.0 and junk_score["score"] < 50.0)
    print(f"Scoring Engine Sanity: {'PASSED' if scoring_valid else 'FAILED'}")
    print(f"  - Healthy Meal Score: {healthy_score['score']} ({healthy_score['label']})")
    print(f"  - Junk Meal Score: {junk_score['score']} ({junk_score['label']})")

    print("=" * 60)
    print("ALL EVALUATION CHECKS COMPLETED.")
    print("=" * 60)

if __name__ == "__main__":
    run_evaluation()
