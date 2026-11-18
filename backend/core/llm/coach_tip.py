from __future__ import annotations

import logging
from config import settings
from core.llm.client import call_llm
from core.llm.prompts import COACH_TIP_PROMPT

logger = logging.getLogger("nutrifit.coach")

def generate_coach_tip(kcal: float, protein: float, fibre: float, sugar: float, score: float) -> str:
    """Generate concise coaching advice using LLM or rule-based templates."""
    if settings.LLM_PROVIDER != "none":
        prompt = COACH_TIP_PROMPT.format(
            kcal=round(kcal, 1),
            protein=round(protein, 1),
            fibre=round(fibre, 1),
            sugar=round(sugar, 1),
            score=round(score, 1)
        )
        tip = call_llm(prompt)
        if tip:
            return tip.strip().strip('"')

    # Deterministic rule-based coach feedback
    if score >= 85:
        return "Excellent balance of macronutrients! Keep prioritizing quality protein and fibre-rich whole foods."
    elif score >= 70:
        if protein < 15:
            return "Good meal! Consider adding a source of lean protein like sprouts, paneer, or eggs to stay fuller longer."
        elif fibre < 3:
            return "Nice choice! Boost digestive health by tossing in a fresh vegetable salad or chia seeds."
        else:
            return "Solid nutritional choices. Stay hydrated and keep up the consistent routine!"
    elif score >= 50:
        if sugar > 20:
            return "Sugar is slightly elevated. Try swapping sugary beverages for unsweetened buttermilk or infused water."
        elif protein < 10:
            return "Protein is a bit low in this meal. Adding dal, curd, or paneer would greatly improve satiety."
        else:
            return "Fairly balanced meal, but watch portion sizes and refined oils."
    else:
        if sugar > 25:
            return "High sugar content detected. Swap sweet treats with fresh fruits like papaya or guava for natural sweetness."
        else:
            return "This meal leans heavy on fried or refined foods. Balance your next meal with green vegetables and dal."
