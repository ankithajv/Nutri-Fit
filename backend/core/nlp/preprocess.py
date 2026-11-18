from __future__ import annotations

import re

def normalize_meal_text(text: str) -> str:
    """Preprocess and clean raw user meal text."""
    if not text:
        return ""
    text = text.lower().strip()
    # Normalize common abbreviations and separators
    text = re.sub(r'[\t\r]+', ' ', text)
    # Replace symbols like &, + with comma for easier item separation
    text = re.sub(r'\s*&\s*', ', ', text)
    text = re.sub(r'\s*\+\s*', ', ', text)
    # Replace multiple spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
