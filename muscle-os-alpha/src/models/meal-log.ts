import type { FoodEntry } from './food-item';

export interface MealLog {
  id: string;
  date: string;
  mealName: string;
  entries: FoodEntry[];
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber?: number;
  totalVitaminC?: number;
  totalVitaminD?: number;
  totalCalcium?: number;
  totalIron?: number;
  totalMagnesium?: number;
  totalZinc?: number;
  totalPotassium?: number;
  createdAt: number;
}

export interface DailyNutrition {
  date: string;
  meals: MealLog[];
  totals: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitaminC: number;
    vitaminD: number;
    calcium: number;
    iron: number;
    magnesium: number;
    zinc: number;
    potassium: number;
  };
  targets: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitaminC: number;
    vitaminD: number;
    calcium: number;
    iron: number;
    magnesium: number;
    zinc: number;
    potassium: number;
  };
}

export interface WeightLog {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercent?: number;
  waistCm?: number;
  notes?: string;
  createdAt: number;
}

export interface NutritionPlan {
  tdee: number;
  targetCalories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  proteinPerKg: number;
  fatPerKg: number;
  carbsPerKg: number;
  adjustmentLabel: string;
  bmr: number;
  activityLevel: string;
  goal: string;
  profile: string;
  sex?: string;
}
