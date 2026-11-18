from __future__ import annotations

import json
import logging
import re
from typing import Any
from sqlalchemy.orm import Session
from config import settings
from core.nlp.rule_parser import parse_meal_text
from core.llm.prompts import EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT
from core.llm.client import call_llm
from core.llm.cache import get_cached_extraction, store_cached_extraction
from core.llm.budget import check_and_increment_llm_budget

logger = logging.getLogger("nutrifit.extractor")

def parse_llm_json_response(raw_text: str) -> list[dict[str, Any]] | None:
    """Extract and validate JSON array from LLM response."""
    if not raw_text:
        return None
    # Find JSON array bracket
    match = re.search(r'\[.*\]', raw_text, re.DOTALL)
    if not match:
        return None
    try:
        data = json.loads(match.group(0))
        if not isinstance(data, list):
            return None
        valid_items = []
        for item in data:
            if isinstance(item, dict) and "name" in item:
                valid_items.append({
                    "name": str(item["name"]).strip().lower(),
                    "quantity": float(item.get("quantity", 1.0)),
                    "unit": str(item.get("unit", "piece")).strip().lower(),
                    "raw": f"{item.get('quantity', 1.0)} {item.get('unit', '')} {item['name']}".strip()
                })
        return valid_items if valid_items else None
    except Exception as e:
        logger.warning(f"Failed to parse LLM JSON response: {e}")
        return None

def extract_foods_from_text(text: str, db: Session, user_id: int | None = None) -> list[dict[str, Any]]:
    """
    Extract foods from raw text using cache -> LLM (if enabled & budget allows) -> rule_parser fallback.
    """
    cleaned_text = text.strip()[:settings.MAX_INPUT_CHARS]
    if not cleaned_text:
        return []

    # 1. Check Cache
    cached = get_cached_extraction(db, cleaned_text)
    if cached:
        logger.info("Retrieved extraction from LLM cache.")
        return cached

    # 2. Check if LLM is enabled
    if settings.LLM_PROVIDER == "none":
        return parse_meal_text(cleaned_text)

    # 3. Check User Budget
    has_budget = check_and_increment_llm_budget(db, user_id)
    if not has_budget:
        logger.info(f"User {user_id} exceeded daily LLM quota. Falling back to rule parser.")
        return parse_meal_text(cleaned_text)

    # 4. Call LLM
    prompt = EXTRACTION_USER_PROMPT.format(text=cleaned_text)
    llm_resp = call_llm(prompt, EXTRACTION_SYSTEM_PROMPT)

    # 5. Parse LLM response
    items = parse_llm_json_response(llm_resp) if llm_resp else None
    if items:
        # Cache successful response
        store_cached_extraction(db, cleaned_text, items)
        return items

    # 6. Fallback to rule parser
    logger.info("LLM extraction failed or was empty, falling back to rule parser.")
    return parse_meal_text(cleaned_text)
