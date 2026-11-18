import { MealType } from '../types';

export interface MealConfig {
  key: MealType;
  label: string;
  iconName: 'Coffee' | 'Sun' | 'UtensilsCrossed' | 'Apple' | 'Moon';
  bg: string;
  description: string;
}

export const MEAL_TYPES: MealConfig[] = [
  { key: 'breakfast', label: 'Breakfast', iconName: 'Coffee', bg: '#FEF3C7', description: 'Morning fuel' },
  { key: 'brunch', label: 'Brunch', iconName: 'Sun', bg: '#FDE8D8', description: 'Mid-day meal' },
  { key: 'lunch', label: 'Lunch', iconName: 'UtensilsCrossed', bg: '#DCF4DC', description: 'Afternoon power' },
  { key: 'snacks', label: 'Snacks', iconName: 'Apple', bg: '#E8D4F4', description: 'Quick bites' },
  { key: 'dinner', label: 'Dinner', iconName: 'Moon', bg: '#D4E4F4', description: 'Evening nourishment' },
];

export const MOTIVATIONAL_QUOTES = [
  'Small steps, big changes.',
  'Your body deserves good food.',
  'Know what you eat.',
  "Nourish, don't punish.",
  'Every meal is a fresh start.',
];

export const QUICK_ADD_CHIPS = [
  '2 chapati',
  '1 cup rice',
  '1 egg',
  '1 banana',
  '1 cup dal',
];

export const COMMON_UNITS = [
  'portion',
  'cup',
  'bowl',
  'piece',
  'plate',
  'slice',
  'glass',
  'tbsp',
  'grams',
  'ml',
];
