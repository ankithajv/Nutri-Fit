export type MealType = 'breakfast' | 'brunch' | 'lunch' | 'snacks' | 'dinner';

export interface User {
  id: string;
  name: string;
  email: string;
  calorie_goal: number;
  protein_goal?: number;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FoodItem {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  matched_food?: string;
  confidence?: ConfidenceLevel;
  has_sugar?: boolean;
  is_beverage?: boolean;
  has_oil?: boolean;
  is_fried?: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fibre?: number;
  sugar?: number;
  sodium?: number;
}

export interface Meal {
  id: string;
  user_id?: string;
  meal_type: MealType;
  date: string;
  raw_text?: string;
  items: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fibre?: number;
  total_sugar?: number;
  total_sodium?: number;
  created_at?: string;
}

export interface MealAnalysis {
  meal_id: string;
  score: number;
  score_label: 'Great' | 'Good' | 'Okay' | 'Needs balance';
  calories: number;
  daily_calorie_goal: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  nutrients: {
    fibre: number;
    sugar: number;
    sodium: number;
  };
  foods: Array<{
    name: string;
    calories: number;
    status: 'green' | 'amber' | 'red';
    reason?: string;
  }>;
  chips: string[];
  feedback: {
    type: 'praise' | 'warning';
    message: string;
    swap_suggestion?: string;
  };
  coach_tip?: string;
}

export interface DayAnalysisData {
  date: string;
  score: number;
  score_label: string;
  total_calories: number;
  calorie_goal: number;
  macros: {
    protein: { current: number; goal: number };
    carbs: { current: number; goal: number };
    fat: { current: number; goal: number };
  };
  meals: Array<{
    meal_type: MealType;
    logged: boolean;
    calories: number;
    protein?: number;
    meal_id?: string;
  }>;
  checklist: {
    protein: { pass: boolean; note: string };
    fibre: { pass: boolean; note: string };
    variety: { pass: boolean; note: string };
    sugar: { pass: boolean; note: string };
    sodium: { pass: boolean; note: string };
  };
  banner: {
    type: 'praise' | 'warning';
    message: string;
  };
}

export interface WeeklyReportData {
  start_date: string;
  end_date: string;
  daily_calories: Array<{
    day: string;
    date: string;
    calories: number;
    goal: number;
  }>;
  macro_trends: Array<{
    day: string;
    date: string;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  daily_scores: Array<{
    day: string;
    date: string;
    score: number;
  }>;
  stats: {
    streak: number;
    consistency_pct: number;
    junk_days_count: number;
    frequent_foods: Array<{ name: string; count: number }>;
  };
  badges: Array<{
    id: string;
    title: string;
    description: string;
    earned: boolean;
  }>;
  warning_card?: {
    title: string;
    repeated_foods: string[];
    swaps: string[];
  };
  summary_bullets: string[];
}
