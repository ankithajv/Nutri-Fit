# Health Scoring Formula

> **Disclaimer**: This score is a diet-quality heuristic, not a clinical measure.
> It is designed to provide useful feedback on meal balance, not to diagnose
> or treat any medical condition.

---

## Meal Score (0–100)

### Formula

```
Score = 50 (base)
      + protein_score
      + fibre_score
      - sugar_penalty
      - sodium_penalty
      + macro_balance_bonus
      - junk_penalty

Clamped to [0, 100]
```

### Components

| Component | Range | Calculation |
|-----------|-------|-------------|
| `protein_score` | 0–25 pts | `min(protein_g / 10, 1) × 25` |
| `fibre_score` | 0–20 pts | `min(fibre_g / 3, 1) × 20` |
| `sugar_penalty` | 0–20 pts | `min(sugar_g / 25, 1) × 20` |
| `sodium_penalty` | 0–15 pts | `min(sodium_mg / 600, 1) × 15` |
| `macro_balance_bonus` | 0–10 pts | `10` if fat 20–35% and carbs 45–65% of total kcal |
| `junk_penalty` | 0–30 pts | `30 × (junk_kcal / total_kcal)` |

### Score Labels

| Score | Label |
|-------|-------|
| 85–100 | Great |
| 70–84 | Good |
| 50–69 | Okay |
| 0–49 | Needs balance |

---

## Day Score

The day score is the **calorie-weighted average** of all meal scores for the day.

```python
day_score = sum(meal_score × meal_kcal for each logged meal) / total_kcal_logged
```

Unlogged meals do not contribute (not penalised for missing data).

---

## Nutrient Indicators

### Per meal thresholds:

| Nutrient | Low | OK | High |
|----------|-----|----|----- |
| Fibre | < 3g | 3–10g | > 10g |
| Sugar | < 10g | 10–25g | > 25g |
| Sodium | < 300mg | 300–600mg | > 600mg |

---

## Food Tags

Tags are stored as JSON arrays in `food_items.tags`. Scoring uses:

| Tag | Effect |
|-----|--------|
| `junk` | Increases junk_penalty |
| `fried` | Contributes to junk classification |
| `sugary` | Contributes to sugar score |
| `whole_grain` | Positive for fibre score |
| `high_protein` | Positive for protein score |
| `vegetable` | Positive for variety bonus |
| `fruit` | Positive for variety bonus |

---

## Chips (Meal Tags)

Up to 3 short descriptor chips are shown per meal:

| Chip | Condition |
|------|-----------|
| "High protein" | protein_g > 15 |
| "Good fibre" | fibre_g > 5 |
| "Low fibre" | fibre_g < 2 |
| "High sugar" | sugar_g > 20 |
| "High sodium" | sodium_mg > 500 |
| "Balanced macros" | macro_balance_bonus == 10 |
| "Fried food" | any entry tagged 'fried' |
| "Veggie-rich" | 2+ vegetables in meal |
| "Junk-heavy" | junk_kcal/total_kcal > 0.5 |

---

## Weekly Badges

| Badge | Condition |
|-------|-----------|
| "Consistent Logger" | Logged ≥ 6 of 7 days |
| "Balanced Week" | Average day score ≥ 70 |
| "Fibre Champion" | Average fibre ≥ 20g/day |
| "Protein Goal" | Average protein ≥ user's protein goal |
| "Light Sugar Week" | Average sugar ≤ 30g/day |

---

## Thresholds File

All thresholds are in `backend/core/scoring/rules.py`. Edit that file to adjust
the formula without touching any other code.
