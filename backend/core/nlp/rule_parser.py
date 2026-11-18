from __future__ import annotations

import re
from typing import Any
from core.nlp.preprocess import normalize_meal_text
from core.nlp.quantity_parser import parse_quantity_token, WORD_TO_NUMBER

UNIT_CANONICAL = {
    "piece": "piece",
    "pieces": "piece",
    "pc": "piece",
    "pcs": "piece",
    "cup": "cup",
    "cups": "cup",
    "bowl": "bowl",
    "bowls": "bowl",
    "katori": "katori",
    "katoris": "katori",
    "plate": "plate",
    "plates": "plate",
    "slice": "slice",
    "slices": "slice",
    "tablespoon": "tablespoon",
    "tablespoons": "tablespoon",
    "tbsp": "tablespoon",
    "tbsps": "tablespoon",
    "teaspoon": "teaspoon",
    "teaspoons": "teaspoon",
    "tsp": "teaspoon",
    "tsps": "teaspoon",
    "glass": "glass",
    "glasses": "glass",
    "can": "can",
    "cans": "can",
    "scoop": "scoop",
    "scoops": "scoop",
    "bar": "bar",
    "bars": "bar",
    "pack": "packet",
    "packs": "packet",
    "packet": "packet",
    "packets": "packet",
    "handful": "handful",
    "handfuls": "handful",
    "gram": "gram",
    "grams": "gram",
    "g": "gram",
    "gm": "gram",
    "gms": "gram",
    "ml": "ml",
    "portion": "serving",
    "portions": "serving",
    "serving": "serving",
    "servings": "serving"
}

def split_items(text: str) -> list[str]:
    """Split text into raw item phrases by commas, semicolons, newlines, 'and', and 'with'."""
    text = normalize_meal_text(text)
    # Replace ' and ' or ' with ' with commas if surrounding text looks like food items
    text = re.sub(r'\s+and\s+', ', ', text)
    text = re.sub(r'\s+with\s+', ', ', text)
    chunks = re.split(r'[,;\n]+', text)
    result = []
    for c in chunks:
        c = c.strip()
        if c:
            result.append(c)
    return result

def parse_single_item(item_str: str) -> dict[str, Any] | None:
    """Parse a single item phrase into quantity, unit, name, and raw string."""
    raw = item_str.strip()
    if not raw:
        return None

    # Check for leading number or word number or fraction
    # Example patterns:
    # "2 1/2 cups of rice"
    # "1.5 bowl dal"
    # "2 idli"
    # "half cup milk"
    # "a plate of biryani"
    tokens = raw.split()
    if not tokens:
        return None

    quantity: float = 1.0
    unit: str = "piece"
    name_tokens: list[str] = []

    # Try matching first 2 tokens as mixed fraction (e.g. "1 1/2")
    if len(tokens) >= 2:
        potential_mixed = f"{tokens[0]} {tokens[1]}"
        mixed_val = parse_quantity_token(potential_mixed)
        if mixed_val is not None:
            quantity = mixed_val
            tokens = tokens[2:]
        else:
            first_val = parse_quantity_token(tokens[0])
            if first_val is not None:
                quantity = first_val
                tokens = tokens[1:]
    else:
        first_val = parse_quantity_token(tokens[0])
        if first_val is not None:
            quantity = first_val
            tokens = tokens[1:]

    # Now check if next token is a recognized unit
    if tokens:
        first_token = tokens[0].lower().rstrip(",.")
        if first_token in UNIT_CANONICAL:
            unit = UNIT_CANONICAL[first_token]
            tokens = tokens[1:]
        elif len(tokens) > 1 and f"{first_token} {tokens[1].lower()}" in UNIT_CANONICAL:
            unit = UNIT_CANONICAL[f"{first_token} {tokens[1].lower()}"]
            tokens = tokens[2:]

    # Remove filler words like "of", "a", "the" at start of name
    while tokens and tokens[0].lower() in ("of", "a", "an", "the"):
        tokens = tokens[1:]

    name = " ".join(tokens).strip().rstrip(",.")
    if not name:
        name = raw

    # Clean plural suffix from name if unit was piece
    # e.g. "2 idlis" -> "idli", "2 chapatis" -> "chapati"
    if name.endswith("s") and len(name) > 3 and not name.endswith("ss"):
        singular_candidate = name[:-1]
        # Common known words where removing 's' is appropriate
        if singular_candidate.endswith("ie"):
            singular_candidate = singular_candidate[:-2] + "y"
        name = singular_candidate

    return {
        "name": name,
        "quantity": float(quantity),
        "unit": unit,
        "raw": raw
    }

def parse_meal_text(text: str) -> list[dict[str, Any]]:
    """Parse a full meal description into structured food item dictionaries."""
    raw_chunks = split_items(text)
    parsed_items = []
    for chunk in raw_chunks:
        parsed = parse_single_item(chunk)
        if parsed and parsed["name"]:
            parsed_items.append(parsed)
    return parsed_items
