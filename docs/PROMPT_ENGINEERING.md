# Prompt Engineering Guide

## Overview

NutriFit uses LLMs only as a **fallback** when the rule-based parser has low confidence. All nutrient values and scoring are computed by Python — the LLM never performs arithmetic.

---

## Design Principles

1. **LLM never does arithmetic.** It extracts text → structured JSON only.
2. **JSON-only output.** No prose. No explanation. Just the array.
3. **max_tokens ≈ 150.** Meals rarely exceed 5 items; this is enough.
4. **temperature = 0.** Deterministic output for caching.
5. **No chat history.** Each call is stateless.
6. **Input capped at 300 characters.** Prevents prompt injection and abuse.

---

## Extraction Prompt

Used when rule-based confidence < 0.6.

```
System: You are a food extraction assistant. Extract food items from meal descriptions.
Return ONLY a valid JSON array. No explanation. No markdown.
Each item must have: {"name": string, "quantity": number, "unit": string}
Units must be one of: piece, cup, bowl, katori, plate, tablespoon, teaspoon, gram, ml
If quantity is unknown, use 1. If unit is unknown, use "piece".

User: 2 idli, 1 bowl sambar, 1 cup coffee with sugar
```

**Expected output:**
```json
[
  {"name": "idli", "quantity": 2, "unit": "piece"},
  {"name": "sambar", "quantity": 1, "unit": "bowl"},
  {"name": "coffee", "quantity": 1, "unit": "cup"}
]
```

**Input token estimate:** ~40 tokens  
**Output token estimate:** ~60-100 tokens  
**Total:** well within 150 max_tokens limit

---

## Coach Tip Prompt

Used once per meal analysis when LLM budget allows.

```
System: You are a friendly nutrition coach. Give ONE short tip (max 25 words).
Be warm and encouraging. No medical claims. No diagnoses.
Return ONLY the tip text, no quotes, no explanation.

User: Meal score: 72. High carbs, low protein. Main foods: rice, dal, pickle.
```

**Expected output:**
```
Adding a small portion of paneer or eggs can boost protein without many extra calories.
```

---

## Weekly Summary Prompt

Generated once per week, cached for 7 days.

```
System: You are a friendly nutrition coach. Write 3 short bullet points (max 15 words each).
Summarize the week's eating. Be warm and practical. No medical claims.
Return ONLY 3 lines starting with "• ".

User: 7-day stats: avg 1850 kcal, protein 45g/day, 3 junk-heavy days, logged 6/7 days.
Most frequent: rice, dal, samosa (3 times).
```

---

## Validation

LLM responses are validated before use:
1. Must be valid JSON (try to parse)
2. Must be an array
3. Each item must have `name` (string), `quantity` (number > 0), `unit` (from allowed list)
4. Names are further matched against the food database (matcher.py)
5. If validation fails: fall back to rule-based parser output

---

## Caching Strategy

- Key: `SHA-256(LLM_PROVIDER + ":" + normalized_input)`
- Normalized input: lowercase, strip extra spaces, sort items
- TTL: indefinite (food names don't change)
- Storage: `llm_cache` table in MySQL

---

## Budget Control

- Per-user daily limit: `LLM_DAILY_LIMIT=10` (env var)
- Tracked in `llm_usage` table (user_id, date, calls)
- When limit reached: silently use rule-based output
- Reset at midnight UTC

---

## Provider Configuration

| Provider | Env Var | Model Default |
|----------|---------|---------------|
| `gemini` | `GEMINI_API_KEY` | gemini-1.5-flash |
| `groq` | `GROQ_API_KEY` | llama-3.1-8b-instant |
| `ollama` | `OLLAMA_BASE_URL` | llama3.2 (local) |
| `none` | — | Rule-based only |

Set `LLM_PROVIDER=none` to run entirely without an LLM.
