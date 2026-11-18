# NutriFit Architecture

## Overview

NutriFit is a full-stack nutrition tracking web application. Users log meals in plain English, and the app provides instant, visual nutritional analysis. It is built with a strict separation: **all arithmetic and data come from the Python backend and food database**; the LLM is only used for text extraction.

---

## System Diagram

```
Browser (React + Vite)
       │
       │ HTTPS / JSON (REST)
       ▼
FastAPI Backend (port 8000)
       │
       ├── Auth layer (JWT)
       │
       ├── NLP Pipeline
       │     ├── Rule Parser (always runs first)
       │     └── LLM Extractor (only when confidence < threshold)
       │
       ├── Nutrition Engine
       │     ├── Fuzzy Matcher (RapidFuzz)
       │     ├── Unit Converter
       │     └── Calculator (grams × per_100g / 100)
       │
       ├── Scoring Engine
       │     ├── Health Score (rule-based formula)
       │     └── Feedback Generator
       │
       └── Data Layer
             ├── MySQL (via SQLAlchemy + PyMySQL)
             └── CSV data files
```

---

## Backend Modules

### `api/` — HTTP Layer
| File | Responsibility |
|------|----------------|
| `auth.py` | Register, login, JWT tokens, /me |
| `meals.py` | Parse text, confirm meal, CRUD |
| `analysis.py` | Meal, day, week analysis |
| `profile.py` | Goals, sample data, delete |

### `core/nlp/` — Text Processing
| File | Responsibility |
|------|----------------|
| `preprocess.py` | Lowercase, normalise, strip noise |
| `rule_parser.py` | Regex/grammar rules → food items |
| `quantity_parser.py` | "half", "two", "1/2" → float |

### `core/llm/` — LLM Integration
| File | Responsibility |
|------|----------------|
| `client.py` | Abstraction over Gemini/Groq/Ollama/None |
| `prompts.py` | Compact, JSON-only prompts |
| `extractor.py` | Calls LLM, validates JSON output |
| `coach_tip.py` | One-line tip generation |
| `cache.py` | Hash-based response caching |
| `budget.py` | Per-user daily LLM call limits |

### `core/nutrition/` — Nutrition Engine
| File | Responsibility |
|------|----------------|
| `matcher.py` | Exact → alias → fuzzy → semantic match |
| `unit_converter.py` | "1 katori" → grams |
| `calculator.py` | `grams × per_100g / 100` |

### `core/scoring/` — Scoring & Feedback
| File | Responsibility |
|------|----------------|
| `rules.py` | All numeric thresholds (easy to edit) |
| `health_score.py` | Score formula (see SCORING.md) |
| `feedback.py` | Chip/banner/badge/tip objects |

### `db/` — Data Layer
| File | Responsibility |
|------|----------------|
| `database.py` | SQLAlchemy engine, session factory |
| `models.py` | ORM models (users, food_items, meals, etc.) |
| `repository.py` | CRUD operations (no raw SQL in routes) |
| `seed.py` | Load CSV data on first run |

---

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Welcome | Public landing page |
| `/register` | Register | Sign-up form |
| `/login` | Login | Login form |
| `/home` | Home | Dashboard (protected) |
| `/log-meal` | LogMeal | Meal input + confirm flow |
| `/meal-result/:id` | MealResult | Visual analysis |
| `/day-analysis` | DayAnalysis | Full-day dashboard |
| `/weekly-report` | WeeklyReport | 7-day trends |
| `/profile` | Profile | Settings & goals |

---

## Data Flow: Logging a Meal

```
1. User types: "2 idli, 1 bowl sambar, 1 cup coffee"
2. Frontend → POST /api/meals/parse
3. Backend:
   a. Rule parser → [{idli, 2, piece}, {sambar, 1, bowl}, {coffee, 1, cup}]
   b. For each item: fuzzy match against food_items
   c. If confidence < 0.7: flag as ambiguous
   d. If parser fails: call LLM (if configured)
   e. Return parsed items with match confidence
4. Frontend shows editable confirm table
5. User edits if needed, clicks Analyze
6. Frontend → POST /api/meals/confirm
7. Backend:
   a. Convert units to grams
   b. Calculate nutrients: grams × per_100g / 100
   c. Store in meals + meal_entries
   d. Compute health score
   e. Generate feedback objects
   f. Return full analysis
8. Frontend renders visual analysis (ScoreRing, MacroDonut, etc.)
```

---

## Token Efficiency

- Rule parser runs first; LLM called only when confidence < 0.6
- Prompts are compact (< 100 tokens input) with JSON-only output
- LLM responses cached by SHA-256 hash of normalised input
- Per-user daily limit (default: 10 calls)
- Coach tips cached per meal analysis
- Weekly summaries generated and cached once per week

---

## Security

- Passwords hashed with bcrypt (passlib)
- JWT tokens (HS256, 7-day expiry)
- All routes except /register and /login require valid JWT
- Users can only access their own meals and data
- Input validated with Pydantic v2 models
- SQL injection prevented by SQLAlchemy ORM

---

## Deployment (Development)

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # edit with your credentials
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev  # starts on port 5173
```

The frontend proxies API calls to `http://localhost:8000`.
