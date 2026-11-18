# NutriFit 🥗⚡
> An Intelligent, Two-Tier AI Nutrition Tracking & Dietary Coaching Platform

NutriFit bridges the gap between natural language meal logging and rigorous, clinically grounded nutrition intelligence. Built with **FastAPI**, **React 18**, **TypeScript**, and **Google Gemini Flash**, NutriFit uses a unique **Two-Tier Architecture**: deterministic database arithmetic guarantees 100% mathematical accuracy for macros and calories, while the Google Gemini Large Language Model acts as a cognitive clinical dietitian providing actionable meal feedback, glycemic stability insights, and practical culinary swaps.

---

## 🌟 Key Features

- **Natural Language Meal Logging**: Type meals naturally in Indian English (e.g., *"2 whole wheat chapatis, 1 katori moong dal tadka, and a small bowl of curd"*).
- **Two-Tier Verification Engine**:
  - **Tier 1 (Ground Truth)**: Exact nutrient arithmetic calculated deterministically against curated Indian Food Composition Tables (IFCT 2017 / NIN-ICMR) and USDA FoodData Central databases.
  - **Tier 2 (Cognitive Layer)**: Google Gemini Flash interprets verified nutritional metrics to provide balanced scoring, glycemic impact feedback, and tailored culinary swaps without hallucinating calorie numbers.
- **Holistic Health Scoring (0–100)**: Evaluates meals and whole days across calorie budget adherence, macro distribution (45–65% Carbs, 15–30% Protein, 20–35% Fat), fibre sufficiency, and junk/free-sugar penalties.
- **Editorial Design System**: Warm, organic aesthetic featuring Sage Greens (`#547A46`), Crisp White surfaces, and Terracotta accents (`#F28C38`) with responsive mobile-friendly layouts.
- **Weekly Trend Analytics**: Interactive multi-metric charts for caloric adherence, macronutrient trends, and habit consistency scoring.

---

## 🏗️ Architecture

```
User Input (Natural Language)
        │
        ▼
[FastAPI / Rule Parser / Gemini Extractor]
  Extracts items, quantities, and preparation modifiers (oil-free, sugar-free)
        │
        ▼
[Tier 1: Deterministic Nutrition Calculator]
  Matches items against IFCT 2017 & USDA databases
  Formula: Nutrient = (Grams × Nutrient_per_100g) / 100
        │
        ▼
[Tier 2: Gemini Flash Cognitive Interpreter]
  Input: Verified kcal, macros, micronutrients, food items
  Output: Glycemic feedback, actionable dietitian tips, culinary swaps
        │
        ▼
[Modern React + Tailwind Frontend]
  Score rings, interactive macro donuts, insight tiles, weekly reports
```

---

## 📂 Project Structure

```
NutriFit/
├── backend/
│   ├── api/                 # FastAPI routes (auth, meals, analysis, profile)
│   ├── core/
│   │   ├── llm/             # Gemini client, analyzer, prompts, budget manager
│   │   ├── nlp/             # Text preprocessing, quantity parsing, rule parser
│   │   ├── nutrition/       # IFCT/USDA matcher, unit converter, nutrient calculator
│   │   └── scoring/         # Health scoring algorithm, dietary feedback rules
│   ├── data/                # IFCT & USDA curated food composition datasets & aliases
│   ├── db/                  # SQLAlchemy models, database connection, repositories
│   ├── tests/               # Pytest unit & integration test suites
│   ├── config.py            # Pydantic environment settings
│   ├── main.py              # Application entry point
│   ├── requirements.txt     # Python backend dependencies
│   └── .env.example         # Template for environment configuration
├── frontend/
│   ├── public/              # Static assets and images
│   ├── src/
│   │   ├── api/             # Axios client with interceptors
│   │   ├── components/      # UI components (analysis, charts, layout, meals)
│   │   ├── context/         # React Auth context
│   │   ├── hooks/           # Custom React hooks (useMeals, useAnalysis)
│   │   ├── pages/           # Welcome, Home, LogMeal, MealResult, DayAnalysis, WeeklyReport
│   │   ├── styles/          # Tailwind styling and design tokens
│   │   └── types/           # TypeScript interface definitions
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies and scripts
│   ├── tailwind.config.js   # Tailwind design configuration
│   └── vite.config.ts       # Vite build configuration
├── docs/                    # Architecture, scoring, and prompt engineering specifications
├── .gitignore               # Production-grade gitignore
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & npm
- **MySQL 8.0+**
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/))

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment (recommended):**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux / macOS:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and supply your database credentials and Gemini API key:
   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=nutriai

   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash-lite
   ```

5. **Start the backend server:**
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   API Documentation is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Access the web application at: [http://127.0.0.1:5173](http://127.0.0.1:5173).

---

## 🧪 Running Tests

To run the backend test suite:
```bash
cd backend
pytest tests/ -v
```

---

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.
