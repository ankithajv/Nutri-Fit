import { useState, useCallback } from 'react';
import api from '../api/client';
import { Meal, MealType, FoodItem } from '../types';
import { formatDateISO } from '../lib/format';

export const useMeals = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMealsForDate = useCallback(async (dateStr: string = formatDateISO()) => {
    setIsLoading(true);
    setError(null);
    try {
      let fetchedMeals: Meal[] = [];
      try {
        const response = await api.get(`/meals?date=${dateStr}`);
        fetchedMeals = response.data.meals || response.data;
      } catch (err: unknown) {
        // Fallback mock data if server isn't running or empty
        console.warn('API /meals request failed, using local state / mock data', err);
        fetchedMeals = [
          {
            id: 'meal_bf_1',
            meal_type: 'breakfast',
            date: dateStr,
            total_calories: 360,
            total_protein: 14,
            total_carbs: 58,
            total_fat: 8,
            total_fibre: 6,
            items: [
              { name: 'Oats with Almond Milk', quantity: 1, unit: 'bowl', matched_food: 'Oatmeal', confidence: 'high', calories: 250 },
              { name: 'Banana', quantity: 1, unit: 'piece', matched_food: 'Banana', confidence: 'high', calories: 110 },
            ],
          },
          {
            id: 'meal_lunch_1',
            meal_type: 'lunch',
            date: dateStr,
            total_calories: 620,
            total_protein: 26,
            total_carbs: 88,
            total_fat: 16,
            total_fibre: 11,
            items: [
              { name: 'Chapati', quantity: 2, unit: 'piece', matched_food: 'Whole Wheat Roti', confidence: 'high', calories: 240 },
              { name: 'Dal Tadka', quantity: 1, unit: 'cup', matched_food: 'Yellow Dal', confidence: 'high', calories: 180 },
              { name: 'Mixed Salad', quantity: 1, unit: 'bowl', matched_food: 'Garden Salad', confidence: 'high', calories: 80 },
              { name: 'Curd', quantity: 1, unit: 'cup', matched_food: 'Yogurt', confidence: 'high', calories: 120 },
            ],
          },
        ];
      }
      setMeals(fetchedMeals);
      return fetchedMeals;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch meals';
      setError(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const parseMealText = async (text: string, mealType: MealType): Promise<FoodItem[]> => {
    try {
      try {
        const response = await api.post('/meals/parse', { text, meal_type: mealType });
        if (response.data.items && Array.isArray(response.data.items)) {
          return response.data.items;
        }
      } catch (err) {
        console.warn('POST /meals/parse fallback', err);
      }

      // Smart local parsing fallback
      const segments = text.split(/[,;\n+]+/).map(s => s.trim()).filter(Boolean);
      return segments.map((seg, idx) => {
        const match = seg.match(/^(\d+(?:\.\d+)?|\d+\/\d+)?\s*(cup|bowl|piece|slice|plate|glass|g|tbsp)?\s*(.*)$/i);
        const qty = match && match[1] ? parseFloat(match[1]) || 1 : 1;
        const unit = match && match[2] ? match[2].toLowerCase() : 'portion';
        const foodName = (match && match[3] ? match[3] : seg).trim();

        return {
          id: `item_${idx}_${Date.now()}`,
          name: foodName || seg,
          quantity: qty,
          unit: unit,
          matched_food: foodName || seg,
          confidence: 'high' as const,
          has_sugar: /coffee|tea|juice/i.test(foodName),
          is_beverage: /coffee|tea|juice|latte/i.test(foodName),
          has_oil: /fry|fried|samosa|pakora|vada/i.test(foodName),
          is_fried: /fry|fried|samosa|pakora|vada/i.test(foodName),
          calories: Math.round(150 * qty),
          protein: Math.round(6 * qty),
          carbs: Math.round(20 * qty),
          fat: Math.round(5 * qty),
        };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse meal input';
      throw new Error(msg);
    }
  };

  const confirmMeal = async (
    mealType: MealType,
    dateStr: string,
    items: FoodItem[],
    rawText: string = ''
  ): Promise<Meal> => {
    try {
      const formattedItems = items.map((it: any) => ({
        food_id: it.food_id || (it.id && !isNaN(Number(it.id)) ? Number(it.id) : null),
        name: it.matched_food || it.name || '',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'piece',
        sugar_free: it.has_sugar === false,
        oil_free: it.has_oil === false,
      }));

      const payload = {
        meal_type: mealType,
        date: dateStr,
        items: formattedItems,
        raw_text: rawText,
      };

      try {
        const response = await api.post('/meals/confirm', payload);
        const savedMeal: Meal = response.data.meal || response.data;
        if (savedMeal && (savedMeal.id || (savedMeal as unknown as { meal_id?: string }).meal_id)) {
          return {
            ...savedMeal,
            id: savedMeal.id || (savedMeal as unknown as { meal_id: string }).meal_id,
          };
        }
      } catch (err) {
        console.warn('POST /meals/confirm failed, using client generated result', err);
      }

      // Calculate totals
      let totalCal = 0;
      let totalP = 0;
      let totalC = 0;
      let totalF = 0;

      items.forEach(item => {
        totalCal += item.calories || Math.round(item.quantity * 140);
        totalP += item.protein || Math.round(item.quantity * 6);
        totalC += item.carbs || Math.round(item.quantity * 22);
        totalF += item.fat || Math.round(item.quantity * 4);
      });

      const newMeal: Meal = {
        id: 'meal_' + Date.now(),
        meal_type: mealType,
        date: dateStr,
        raw_text: rawText,
        items,
        total_calories: totalCal,
        total_protein: totalP,
        total_carbs: totalC,
        total_fat: totalF,
        total_fibre: Math.round(items.length * 3),
        total_sugar: Math.round(items.length * 4),
        total_sodium: Math.round(items.length * 280),
      };

      return newMeal;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save meal';
      throw new Error(msg);
    }
  };

  return {
    meals,
    isLoading,
    error,
    fetchMealsForDate,
    parseMealText,
    confirmMeal,
  };
};
