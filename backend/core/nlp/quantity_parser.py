from __future__ import annotations

import re
from fractions import Fraction

WORD_TO_NUMBER = {
    "half": 0.5,
    "quarter": 0.25,
    "a": 1.0,
    "an": 1.0,
    "one": 1.0,
    "two": 2.0,
    "three": 3.0,
    "four": 4.0,
    "five": 5.0,
    "six": 6.0,
    "seven": 7.0,
    "eight": 8.0,
    "nine": 9.0,
    "ten": 10.0,
    "eleven": 11.0,
    "twelve": 12.0,
}

def parse_quantity_token(token: str) -> float | None:
    """Convert quantity tokens like 'half', '2', '1.5', '1/2', '1 1/2' to a float."""
    token = token.strip().lower()
    if not token:
        return None

    if token in WORD_TO_NUMBER:
        return WORD_TO_NUMBER[token]

    # Mixed fraction like '1 1/2' or '2 1/4'
    mixed_match = re.match(r"^(\d+)\s+(\d+/\d+)$", token)
    if mixed_match:
        whole = float(mixed_match.group(1))
        frac = float(Fraction(mixed_match.group(2)))
        return whole + frac

    # Simple fraction like '1/2' or '3/4'
    if "/" in token:
        try:
            return float(Fraction(token))
        except (ValueError, ZeroDivisionError):
            return None

    # Decimal or integer
    try:
        return float(token)
    except ValueError:
        return None
