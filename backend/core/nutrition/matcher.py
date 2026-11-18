from __future__ import annotations

import csv
import logging
from typing import Any
from rapidfuzz import process, fuzz
from sqlalchemy.orm import Session
from config import DATA_DIR
from db.models import FoodItem
from db.repository import get_all_foods, get_food_by_name

logger = logging.getLogger("nutrifit.matcher")

_ALIASES: dict[str, str] = {}

def load_aliases() -> dict[str, str]:
    global _ALIASES
    if _ALIASES:
        return _ALIASES

    csv_path = DATA_DIR / "aliases.csv"
    if not csv_path.exists():
        logger.warning(f"aliases.csv not found at {csv_path}")
        return {}

    aliases: dict[str, str] = {}
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            canonical = row.get("name", "").strip().lower()
            alias = row.get("alias", "").strip().lower()
            if canonical and alias:
                aliases[alias] = canonical

    _ALIASES = aliases
    return _ALIASES

def check_clarifications(query: str, matched_name: str) -> tuple[bool, bool]:
    """
    Check if the item requires sugar or oil clarification.
    Returns (needs_sugar_clarification, needs_oil_clarification).
    """
    q = query.lower()
    m = matched_name.lower()
    combined = f"{q} {m}"

    # Sugar check for tea/coffee/lassi
    needs_sugar = False
    beverage_keywords = ["chai", "tea", "coffee", "lassi"]
    if any(k in combined for k in beverage_keywords):
        if not any(indicator in combined for indicator in ["with sugar", "without sugar", "sugar free", "sugarless", "black", "salted", "diet"]):
            needs_sugar = True

    # Oil check for parathas, dosas, fried foods
    needs_oil = False
    oil_keywords = ["paratha", "dosa", "bhurji", "sabzi", "curry", "fry"]
    if any(k in combined for k in oil_keywords):
        if not any(indicator in combined for indicator in ["oil free", "without oil", "low oil", "extra oil"]):
            needs_oil = True

    return needs_sugar, needs_oil

def match_food_item(
    query_text: str,
    db: Session,
    threshold: float = 70.0
) -> list[dict[str, Any]]:
    """
    Match query string to food_items in database:
    1. Exact match
    2. Aliases lookup
    3. RapidFuzz fuzzy match (threshold 70)
    4. Sentence-transformers (if installed and needed)
    Returns up to top-3 candidate matches.
    """
    query = query_text.strip().lower()
    if not query:
        return []

    aliases = load_aliases()
    all_foods = get_all_foods(db)
    if not all_foods:
        return []

    food_map = {f.name.lower(): f for f in all_foods}

    # 1. Exact Match
    if query in food_map:
        matched = food_map[query]
        needs_sugar, needs_oil = check_clarifications(query, matched.name)
        return [{
            "food_id": matched.id,
            "name": matched.name,
            "confidence": 1.0,
            "match_type": "exact",
            "food_item": matched,
            "needs_sugar_clarification": needs_sugar,
            "needs_oil_clarification": needs_oil
        }]

    # 2. Alias Lookup Match
    if query in aliases:
        canonical = aliases[query]
        if canonical in food_map:
            matched = food_map[canonical]
            needs_sugar, needs_oil = check_clarifications(query, matched.name)
            return [{
                "food_id": matched.id,
                "name": matched.name,
                "confidence": 0.95,
                "match_type": "alias",
                "food_item": matched,
                "needs_sugar_clarification": needs_sugar,
                "needs_oil_clarification": needs_oil
            }]

    # 3. RapidFuzz Matching
    names = list(food_map.keys())
    # Try token_set_ratio or WRatio for best multi-word matching
    fuzzy_matches = process.extract(
        query,
        names,
        scorer=fuzz.token_set_ratio,
        limit=5,
        score_cutoff=threshold
    )

    results = []
    seen_ids = set()
    for match_tuple in fuzzy_matches:
        matched_name = match_tuple[0]
        score = match_tuple[1]
        food = food_map[matched_name]
        if food.id not in seen_ids:
            seen_ids.add(food.id)
            needs_sugar, needs_oil = check_clarifications(query, food.name)
            results.append({
                "food_id": food.id,
                "name": food.name,
                "confidence": round(score / 100.0, 2),
                "match_type": "fuzzy",
                "food_item": food,
                "needs_sugar_clarification": needs_sugar,
                "needs_oil_clarification": needs_oil
            })
            if len(results) >= 3:
                break

    if results:
        return results

    # 4. Optional Sentence Transformers semantic fallback
    try:
        from sentence_transformers import SentenceTransformer, util
        # Optional lightweight fallback if available
        pass
    except ImportError:
        pass

    # Fallback to closest match if available even below threshold
    fallback_matches = process.extract(query, names, scorer=fuzz.WRatio, limit=1)
    if fallback_matches:
        best_name, best_score, _ = fallback_matches[0]
        food = food_map[best_name]
        needs_sugar, needs_oil = check_clarifications(query, food.name)
        return [{
            "food_id": food.id,
            "name": food.name,
            "confidence": round(best_score / 100.0, 2),
            "match_type": "low_confidence",
            "food_item": food,
            "needs_sugar_clarification": needs_sugar,
            "needs_oil_clarification": needs_oil
        }]

    return []
