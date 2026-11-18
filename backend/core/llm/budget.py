from __future__ import annotations

from datetime import date
from sqlalchemy.orm import Session
from config import settings
from db.repository import get_user_daily_llm_calls, increment_user_llm_calls

def check_and_increment_llm_budget(db: Session, user_id: int | None) -> bool:
    """
    Check if the user has remaining LLM quota for today.
    If allowed, increments the counter and returns True.
    If user_id is None (unauthenticated or system), allows by default up to system limit.
    """
    if not user_id:
        return True

    today = date.today()
    current_calls = get_user_daily_llm_calls(db, user_id, today)
    if current_calls >= settings.LLM_DAILY_LIMIT:
        return False

    increment_user_llm_calls(db, user_id, today)
    return True
