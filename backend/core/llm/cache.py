from __future__ import annotations

import hashlib
from typing import Any
from sqlalchemy.orm import Session
from db.repository import get_cached_llm, set_cached_llm
from core.nlp.preprocess import normalize_meal_text

def compute_text_hash(text: str) -> str:
    """Compute normalized SHA-256 hash for caching."""
    normalized = normalize_meal_text(text)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

def get_cached_extraction(db: Session, text: str) -> list[dict[str, Any]] | None:
    """Retrieve cached extraction JSON if available."""
    text_hash = compute_text_hash(text)
    cached = get_cached_llm(db, text_hash)
    if cached and isinstance(cached, list):
        return cached
    return None

def store_cached_extraction(db: Session, text: str, data: list[dict[str, Any]]) -> None:
    """Store extraction JSON in cache."""
    text_hash = compute_text_hash(text)
    set_cached_llm(db, text_hash, data)
