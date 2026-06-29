import { v4 as uuid } from 'uuid';
import type { FoodItem, FoodEntry } from '../models/food-item';
import type { MealLog, NutritionPlan, WeightLog } from '../models/meal-log';
import { db } from '../database/db';

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const PROFILE_PROTEIN: Record<string, number> = {
  beginner: 1.8,
  intermediate: 2.0,
  busy: 2.1,
  advanced: 2.2,
  masters: 2.1,
};

const PROFILE_FAT_MIN: Record<string, number> = {
  beginner: 0.8,
  intermediate: 0.8,
  busy: 0.9,
  advanced: 0.7,
  masters: 0.9,
};

const GOAL_ADJUSTMENT: Record<string, [number, number]> = {
  fat_loss: [-500, -300],
  recomp: [-100, 100],
  hypertrophy: [200, 400],
  strength: [0, 200],
};

function roundHalfUp(v: number): number {
  return Math.round(v + 0.5);
}

export function calculateBmr(weightKg: number, heightCm: number, ageYears: number, sex: string): number {
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
}

export function calculateNutrition(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: string,
  activityLevel: string,
  goal: string,
  profile: string,
  customCalories?: number,
): NutritionPlan {
  const bmr = calculateBmr(weightKg, heightCm, ageYears, sex);
  const activityFactor = ACTIVITY_FACTORS[activityLevel] ?? 1.375;
  const tdee = roundHalfUp(bmr * activityFactor);

  const [adjMin, adjMax] = GOAL_ADJUSTMENT[goal] ?? [-300, -300];
  const profilePositions: Record<string, number> = {
    beginner: 0.3,
    intermediate: 0.5,
    busy: 0.3,
    advanced: 0.7,
    masters: 0.3,
  };
  const profilePosition = profilePositions[profile] ?? 0.5;

  const target = customCalories ?? (tdee + roundHalfUp(adjMin + (adjMax - adjMin) * profilePosition));

  const actualAdj = target - tdee;
  let adjLabel: string;
  if (actualAdj < 0) adjLabel = `${Math.abs(actualAdj)} kcal deficit`;
  else if (actualAdj > 0) adjLabel = `${actualAdj} kcal surplus`;
  else adjLabel = 'maintenance';

  const proteinPerKg = PROFILE_PROTEIN[profile] ?? 2.0;
  const proteinG = Math.round(proteinPerKg * weightKg * 10) / 10;
  const proteinCals = proteinG * 4;

  const fatMinPerKg = PROFILE_FAT_MIN[profile] ?? 0.8;
  const fatMinCals = fatMinPerKg * weightKg * 9;

  let remaining = target - proteinCals - fatMinCals;
  let fatG: number, carbsG: number;

  if (remaining < 0) {
    const fatPerKg = Math.max(0.5, (target - proteinCals) / weightKg / 9);
    fatG = Math.round(fatPerKg * weightKg * 10) / 10;
    const remainingAfter = target - proteinCals - fatG * 9;
    carbsG = Math.max(Math.round(remainingAfter / 4 * 10) / 10, 0);
  } else {
    fatG = Math.round(fatMinPerKg * weightKg * 10) / 10;
    const fatCals = fatG * 9;
    const actualCarbs = target - proteinCals - fatCals;
    carbsG = Math.max(Math.round(actualCarbs / 4 * 10) / 10, 0);
  }

  const carbsPerKg = Math.round(carbsG / weightKg * 10) / 10;
  const fatPerKgActual = Math.round(fatG / weightKg * 10) / 10;

  return {
    tdee,
    targetCalories: target,
    proteinG,
    fatG,
    carbsG,
    proteinPerKg,
    fatPerKg: fatPerKgActual,
    carbsPerKg,
    adjustmentLabel: adjLabel,
    bmr: roundHalfUp(bmr),
    activityLevel,
    goal,
    profile,
    sex,
  };
}

// ---------------------------------------------------------------------------
// Food database
// ---------------------------------------------------------------------------

const DEFAULT_FOODS: FoodItem[] = [
  // Protein — animal
  { id: 'f1', name: 'Chicken Breast', category: 'protein_animal', kcalPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.1, calciumPer100g: 11, ironPer100g: 0.7, magnesiumPer100g: 27, zincPer100g: 0.8, potassiumPer100g: 256 },
  { id: 'f2', name: 'Chicken Thigh', category: 'protein_animal', kcalPer100g: 209, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 11, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.2, calciumPer100g: 12, ironPer100g: 0.9, magnesiumPer100g: 23, zincPer100g: 1.5, potassiumPer100g: 249 },
  { id: 'f3', name: 'Chicken Drumstick', category: 'protein_animal', kcalPer100g: 172, proteinPer100g: 23.6, carbsPer100g: 0, fatPer100g: 8.3, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.1, calciumPer100g: 10, ironPer100g: 0.8, magnesiumPer100g: 20, zincPer100g: 1.4, potassiumPer100g: 220 },
  { id: 'f4', name: 'Turkey Breast', category: 'protein_animal', kcalPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 0.7, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.1, calciumPer100g: 13, ironPer100g: 0.5, magnesiumPer100g: 25, zincPer100g: 1.2, potassiumPer100g: 245 },
  { id: 'f5', name: 'Beef Mince 90/10', category: 'protein_animal', kcalPer100g: 215, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 12, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 15, ironPer100g: 2.5, magnesiumPer100g: 20, zincPer100g: 4.5, potassiumPer100g: 295 },
  { id: 'f6', name: 'Beef Mince 95/5', category: 'protein_animal', kcalPer100g: 164, proteinPer100g: 26.8, carbsPer100g: 0, fatPer100g: 5.7, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 12, ironPer100g: 2.3, magnesiumPer100g: 19, zincPer100g: 4.2, potassiumPer100g: 280 },
  { id: 'f7', name: 'Beef Sirloin Steak', category: 'protein_animal', kcalPer100g: 206, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 11, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.1, calciumPer100g: 14, ironPer100g: 2.1, magnesiumPer100g: 22, zincPer100g: 4.8, potassiumPer100g: 330 },
  { id: 'f8', name: 'Beef Ribeye', category: 'protein_animal', kcalPer100g: 271, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 19, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 12, ironPer100g: 1.9, magnesiumPer100g: 18, zincPer100g: 4.1, potassiumPer100g: 270 },
  { id: 'f9', name: 'Lean Pork Chop', category: 'protein_animal', kcalPer100g: 170, proteinPer100g: 28, carbsPer100g: 0, fatPer100g: 6, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0.6, vitaminDPer100g: 0.5, calciumPer100g: 7, ironPer100g: 0.8, magnesiumPer100g: 24, zincPer100g: 1.6, potassiumPer100g: 340 },
  { id: 'f10', name: 'Lamb Chop', category: 'protein_animal', kcalPer100g: 204, proteinPer100g: 29, carbsPer100g: 0, fatPer100g: 9, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.1, calciumPer100g: 16, ironPer100g: 1.6, magnesiumPer100g: 23, zincPer100g: 3.0, potassiumPer100g: 240 },

  // Protein — fish
  { id: 'f11', name: 'Salmon (Atlantic)', category: 'fish', kcalPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 11, calciumPer100g: 12, ironPer100g: 0.5, magnesiumPer100g: 30, zincPer100g: 0.4, potassiumPer100g: 360 },
  { id: 'f12', name: 'Salmon (Pink/Canned)', category: 'fish', kcalPer100g: 136, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 4, servingSizeG: 100, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 13, calciumPer100g: 240, ironPer100g: 0.5, magnesiumPer100g: 27, zincPer100g: 0.5, potassiumPer100g: 280 },
  { id: 'f13', name: 'Tuna (canned in water)', category: 'fish', kcalPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 0.8, servingSizeG: 100, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 1, calciumPer100g: 8, ironPer100g: 0.7, magnesiumPer100g: 24, zincPer100g: 0.5, potassiumPer100g: 180 },
  { id: 'f14', name: 'Cod', category: 'fish', kcalPer100g: 82, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 0.7, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.9, calciumPer100g: 10, ironPer100g: 0.2, magnesiumPer100g: 24, zincPer100g: 0.4, potassiumPer100g: 290 },
  { id: 'f15', name: 'Tilapia', category: 'fish', kcalPer100g: 96, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 1.7, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 1.5, calciumPer100g: 10, ironPer100g: 0.6, magnesiumPer100g: 27, zincPer100g: 0.3, potassiumPer100g: 280 },
  { id: 'f16', name: 'Shrimp', category: 'fish', kcalPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3, servingSizeG: 100, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 50, ironPer100g: 0.3, magnesiumPer100g: 32, zincPer100g: 1.1, potassiumPer100g: 160 },
  { id: 'f17', name: 'Sardines (canned)', category: 'fish', kcalPer100g: 208, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 11, servingSizeG: 100, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 4.8, calciumPer100g: 382, ironPer100g: 2.9, magnesiumPer100g: 39, zincPer100g: 1.3, potassiumPer100g: 397 },
  { id: 'f18', name: 'Mackerel', category: 'fish', kcalPer100g: 205, proteinPer100g: 19, carbsPer100g: 0, fatPer100g: 14, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0.4, vitaminDPer100g: 16, calciumPer100g: 12, ironPer100g: 1.3, magnesiumPer100g: 76, zincPer100g: 0.6, potassiumPer100g: 350 },

  // Protein — eggs & dairy
  { id: 'f19', name: 'Whole Eggs', category: 'eggs_dairy', kcalPer100g: 143, proteinPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, servingSizeG: 100, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 2.0, calciumPer100g: 56, ironPer100g: 1.8, magnesiumPer100g: 12, zincPer100g: 1.3, potassiumPer100g: 138 },
  { id: 'f20', name: 'Egg Whites', category: 'eggs_dairy', kcalPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, servingSizeG: 100, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 7, ironPer100g: 0.1, magnesiumPer100g: 11, zincPer100g: 0.1, potassiumPer100g: 163 },
  { id: 'f21', name: 'Greek Yogurt 0%', category: 'eggs_dairy', kcalPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.2, servingSizeG: 200, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 110, ironPer100g: 0.1, magnesiumPer100g: 11, zincPer100g: 0.5, potassiumPer100g: 141 },
  { id: 'f22', name: 'Greek Yogurt 2%', category: 'eggs_dairy', kcalPer100g: 72, proteinPer100g: 9, carbsPer100g: 3.5, fatPer100g: 2, servingSizeG: 200, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 100, ironPer100g: 0.1, magnesiumPer100g: 10, zincPer100g: 0.5, potassiumPer100g: 130 },
  { id: 'f23', name: 'Cottage Cheese 1%', category: 'eggs_dairy', kcalPer100g: 72, proteinPer100g: 12, carbsPer100g: 3.5, fatPer100g: 1, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.1, calciumPer100g: 83, ironPer100g: 0.1, magnesiumPer100g: 10, zincPer100g: 0.5, potassiumPer100g: 105 },
  { id: 'f24', name: 'Cottage Cheese 4%', category: 'eggs_dairy', kcalPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3, servingSizeG: 150, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.1, calciumPer100g: 72, ironPer100g: 0.1, magnesiumPer100g: 8, zincPer100g: 0.4, potassiumPer100g: 90 },
  { id: 'f25', name: 'Skim Milk', category: 'eggs_dairy', kcalPer100g: 34, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.1, servingSizeG: 250, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 1.0, calciumPer100g: 125, ironPer100g: 0, magnesiumPer100g: 11, zincPer100g: 0.4, potassiumPer100g: 156 },
  { id: 'f26', name: 'Whole Milk', category: 'eggs_dairy', kcalPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, servingSizeG: 250, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 1.0, calciumPer100g: 120, ironPer100g: 0, magnesiumPer100g: 10, zincPer100g: 0.4, potassiumPer100g: 150 },
  { id: 'f27', name: 'Mozzarella (part-skim)', category: 'eggs_dairy', kcalPer100g: 280, proteinPer100g: 28, carbsPer100g: 3.1, fatPer100g: 17, servingSizeG: 50, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 700, ironPer100g: 0.3, magnesiumPer100g: 20, zincPer100g: 2.5, potassiumPer100g: 60 },

  // Supplements
  { id: 'f28', name: 'Whey Protein', category: 'supplements', kcalPer100g: 395, proteinPer100g: 80, carbsPer100g: 7, fatPer100g: 5, servingSizeG: 30, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 450, ironPer100g: 0.7, magnesiumPer100g: 80, zincPer100g: 1.5, potassiumPer100g: 200 },
  { id: 'f29', name: 'Casein Protein', category: 'supplements', kcalPer100g: 380, proteinPer100g: 75, carbsPer100g: 6, fatPer100g: 4, servingSizeG: 30, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 500, ironPer100g: 0.5, magnesiumPer100g: 60, zincPer100g: 1.2, potassiumPer100g: 180 },
  { id: 'f30', name: 'Mass Gainer', category: 'supplements', kcalPer100g: 400, proteinPer100g: 25, carbsPer100g: 65, fatPer100g: 5, servingSizeG: 100, fiberPer100g: 0.5, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 200, ironPer100g: 0.5, magnesiumPer100g: 40, zincPer100g: 0.8, potassiumPer100g: 150 },
  { id: 'f31', name: 'Creatine Monohydrate', category: 'supplements', kcalPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, servingSizeG: 5, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 0, ironPer100g: 0, magnesiumPer100g: 0, zincPer100g: 0, potassiumPer100g: 0 },

  // Carbs — grains
  { id: 'f32', name: 'White Rice (cooked)', category: 'carb_grains', kcalPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, servingSizeG: 200, fiberPer100g: 0.4, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 3, ironPer100g: 0.2, magnesiumPer100g: 12, zincPer100g: 0.5, potassiumPer100g: 35 },
  { id: 'f33', name: 'Brown Rice (cooked)', category: 'carb_grains', kcalPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 1, servingSizeG: 200, fiberPer100g: 1.6, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 3, ironPer100g: 0.4, magnesiumPer100g: 43, zincPer100g: 0.6, potassiumPer100g: 43 },
  { id: 'f34', name: 'Basmati Rice (cooked)', category: 'carb_grains', kcalPer100g: 120, proteinPer100g: 2.5, carbsPer100g: 26, fatPer100g: 0.3, servingSizeG: 200, fiberPer100g: 0.4, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 3, ironPer100g: 0.2, magnesiumPer100g: 12, zincPer100g: 0.5, potassiumPer100g: 35 },
  { id: 'f35', name: 'Oats', category: 'carb_grains', kcalPer100g: 379, proteinPer100g: 13.5, carbsPer100g: 68, fatPer100g: 6.5, servingSizeG: 100, fiberPer100g: 10.6, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 54, ironPer100g: 4.7, magnesiumPer100g: 177, zincPer100g: 3.0, potassiumPer100g: 362 },
  { id: 'f36', name: 'Pasta (cooked)', category: 'carb_grains', kcalPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, servingSizeG: 200, fiberPer100g: 1.8, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 7, ironPer100g: 1.0, magnesiumPer100g: 15, zincPer100g: 0.4, potassiumPer100g: 28 },
  { id: 'f37', name: 'Whole Wheat Pasta', category: 'carb_grains', kcalPer100g: 124, proteinPer100g: 5.3, carbsPer100g: 24, fatPer100g: 0.5, servingSizeG: 200, fiberPer100g: 3.2, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 9, ironPer100g: 1.3, magnesiumPer100g: 28, zincPer100g: 0.6, potassiumPer100g: 50 },
  { id: 'f38', name: 'Whole Wheat Bread', category: 'carb_grains', kcalPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, servingSizeG: 80, fiberPer100g: 5.3, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 80, ironPer100g: 2.7, magnesiumPer100g: 59, zincPer100g: 1.2, potassiumPer100g: 170 },
  { id: 'f39', name: 'White Bread', category: 'carb_grains', kcalPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2, servingSizeG: 80, fiberPer100g: 2.7, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 100, ironPer100g: 2.6, magnesiumPer100g: 18, zincPer100g: 0.6, potassiumPer100g: 95 },
  { id: 'f40', name: 'Tortilla Wrap', category: 'carb_grains', kcalPer100g: 300, proteinPer100g: 8, carbsPer100g: 50, fatPer100g: 7, servingSizeG: 60, fiberPer100g: 3.0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 80, ironPer100g: 2.0, magnesiumPer100g: 20, zincPer100g: 0.7, potassiumPer100g: 120 },
  { id: 'f41', name: 'Couscous (cooked)', category: 'carb_grains', kcalPer100g: 112, proteinPer100g: 3.8, carbsPer100g: 23, fatPer100g: 0.2, servingSizeG: 200, fiberPer100g: 1.2, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 5, ironPer100g: 0.4, magnesiumPer100g: 8, zincPer100g: 0.2, potassiumPer100g: 38 },
  { id: 'f42', name: 'Quinoa (cooked)', category: 'carb_grains', kcalPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9, servingSizeG: 200, fiberPer100g: 2.8, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 17, ironPer100g: 1.5, magnesiumPer100g: 64, zincPer100g: 1.1, potassiumPer100g: 170 },

  // Carbs — starchy
  { id: 'f43', name: 'Potato (boiled)', category: 'carb_starchy', kcalPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1, servingSizeG: 200, fiberPer100g: 1.4, vitaminCPer100g: 7.4, vitaminDPer100g: 0, calciumPer100g: 6, ironPer100g: 0.3, magnesiumPer100g: 19, zincPer100g: 0.3, potassiumPer100g: 344 },
  { id: 'f44', name: 'Sweet Potato', category: 'carb_starchy', kcalPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, servingSizeG: 200, fiberPer100g: 3.0, vitaminCPer100g: 19.6, vitaminDPer100g: 0, calciumPer100g: 30, ironPer100g: 0.6, magnesiumPer100g: 25, zincPer100g: 0.3, potassiumPer100g: 337 },
  { id: 'f45', name: 'French Fries', category: 'carb_starchy', kcalPer100g: 312, proteinPer100g: 3.4, carbsPer100g: 38, fatPer100g: 15, servingSizeG: 150, fiberPer100g: 3.4, vitaminCPer100g: 6.0, vitaminDPer100g: 0, calciumPer100g: 18, ironPer100g: 0.9, magnesiumPer100g: 30, zincPer100g: 0.5, potassiumPer100g: 480 },

  // Carbs — legumes
  { id: 'f46', name: 'Lentils (cooked)', category: 'protein_plant', kcalPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, servingSizeG: 200, fiberPer100g: 7.9, vitaminCPer100g: 1.5, vitaminDPer100g: 0, calciumPer100g: 19, ironPer100g: 3.3, magnesiumPer100g: 36, zincPer100g: 1.3, potassiumPer100g: 257 },
  { id: 'f47', name: 'Chickpeas (canned)', category: 'protein_plant', kcalPer100g: 139, proteinPer100g: 7.2, carbsPer100g: 23, fatPer100g: 2.7, servingSizeG: 150, fiberPer100g: 6.0, vitaminCPer100g: 0.5, vitaminDPer100g: 0, calciumPer100g: 35, ironPer100g: 1.5, magnesiumPer100g: 30, zincPer100g: 0.9, potassiumPer100g: 170 },
  { id: 'f48', name: 'Black Beans (cooked)', category: 'protein_plant', kcalPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 24, fatPer100g: 0.5, servingSizeG: 150, fiberPer100g: 8.7, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 27, ironPer100g: 2.1, magnesiumPer100g: 70, zincPer100g: 1.1, potassiumPer100g: 305 },
  { id: 'f49', name: 'Tofu (firm)', category: 'protein_plant', kcalPer100g: 76, proteinPer100g: 8, carbsPer100g: 2, fatPer100g: 4.8, servingSizeG: 150, fiberPer100g: 0.3, vitaminCPer100g: 0.1, vitaminDPer100g: 0, calciumPer100g: 350, ironPer100g: 5.4, magnesiumPer100g: 37, zincPer100g: 1.6, potassiumPer100g: 150 },
  { id: 'f50', name: 'Edamame', category: 'protein_plant', kcalPer100g: 122, proteinPer100g: 12, carbsPer100g: 9, fatPer100g: 5, servingSizeG: 100, fiberPer100g: 5.2, vitaminCPer100g: 6.1, vitaminDPer100g: 0, calciumPer100g: 63, ironPer100g: 2.3, magnesiumPer100g: 52, zincPer100g: 1.4, potassiumPer100g: 436 },

  // Fruit
  { id: 'f51', name: 'Banana', category: 'fruit', kcalPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, servingSizeG: 120, fiberPer100g: 2.6, vitaminCPer100g: 8.7, vitaminDPer100g: 0, calciumPer100g: 5, ironPer100g: 0.3, magnesiumPer100g: 27, zincPer100g: 0.2, potassiumPer100g: 358 },
  { id: 'f52', name: 'Apple', category: 'fruit', kcalPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, servingSizeG: 180, fiberPer100g: 2.4, vitaminCPer100g: 4.6, vitaminDPer100g: 0, calciumPer100g: 6, ironPer100g: 0.1, magnesiumPer100g: 5, zincPer100g: 0, potassiumPer100g: 107 },
  { id: 'f53', name: 'Orange', category: 'fruit', kcalPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, servingSizeG: 160, fiberPer100g: 2.4, vitaminCPer100g: 53.2, vitaminDPer100g: 0, calciumPer100g: 40, ironPer100g: 0.1, magnesiumPer100g: 10, zincPer100g: 0.1, potassiumPer100g: 181 },
  { id: 'f54', name: 'Blueberries', category: 'fruit', kcalPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3, servingSizeG: 100, fiberPer100g: 2.4, vitaminCPer100g: 9.7, vitaminDPer100g: 0, calciumPer100g: 6, ironPer100g: 0.3, magnesiumPer100g: 6, zincPer100g: 0.2, potassiumPer100g: 77 },
  { id: 'f55', name: 'Strawberries', category: 'fruit', kcalPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 8, fatPer100g: 0.3, servingSizeG: 150, fiberPer100g: 2.0, vitaminCPer100g: 58.8, vitaminDPer100g: 0, calciumPer100g: 16, ironPer100g: 0.4, magnesiumPer100g: 13, zincPer100g: 0.1, potassiumPer100g: 153 },
  { id: 'f56', name: 'Grapes', category: 'fruit', kcalPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2, servingSizeG: 100, fiberPer100g: 0.9, vitaminCPer100g: 3.2, vitaminDPer100g: 0, calciumPer100g: 10, ironPer100g: 0.4, magnesiumPer100g: 7, zincPer100g: 0.1, potassiumPer100g: 191 },
  { id: 'f57', name: 'Mango', category: 'fruit', kcalPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, servingSizeG: 150, fiberPer100g: 1.6, vitaminCPer100g: 36.4, vitaminDPer100g: 0, calciumPer100g: 11, ironPer100g: 0.2, magnesiumPer100g: 10, zincPer100g: 0.1, potassiumPer100g: 168 },
  { id: 'f58', name: 'Pineapple', category: 'fruit', kcalPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1, servingSizeG: 150, fiberPer100g: 1.4, vitaminCPer100g: 47.8, vitaminDPer100g: 0, calciumPer100g: 13, ironPer100g: 0.3, magnesiumPer100g: 12, zincPer100g: 0.1, potassiumPer100g: 109 },

  // Fats — oils
  { id: 'f59', name: 'Olive Oil', category: 'fat_oils', kcalPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, servingSizeG: 15, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 1, ironPer100g: 0.6, magnesiumPer100g: 0, zincPer100g: 0, potassiumPer100g: 1 },
  { id: 'f60', name: 'Coconut Oil', category: 'fat_oils', kcalPer100g: 862, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, servingSizeG: 15, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 0, ironPer100g: 0, magnesiumPer100g: 0, zincPer100g: 0, potassiumPer100g: 0 },
  { id: 'f61', name: 'Butter', category: 'fat_oils', kcalPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81, servingSizeG: 14, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 1.5, calciumPer100g: 24, ironPer100g: 0, magnesiumPer100g: 2, zincPer100g: 0.1, potassiumPer100g: 24 },

  // Fats — nuts & seeds
  { id: 'f62', name: 'Almonds', category: 'fat_nuts', kcalPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, servingSizeG: 30, fiberPer100g: 12.5, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 264, ironPer100g: 3.7, magnesiumPer100g: 268, zincPer100g: 3.1, potassiumPer100g: 705 },
  { id: 'f63', name: 'Peanut Butter', category: 'fat_nuts', kcalPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, servingSizeG: 32, fiberPer100g: 5.0, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 45, ironPer100g: 1.7, magnesiumPer100g: 169, zincPer100g: 2.5, potassiumPer100g: 564 },
  { id: 'f64', name: 'Mixed Nuts', category: 'fat_nuts', kcalPer100g: 607, proteinPer100g: 20, carbsPer100g: 20, fatPer100g: 54, servingSizeG: 30, fiberPer100g: 8.0, vitaminCPer100g: 0.5, vitaminDPer100g: 0, calciumPer100g: 80, ironPer100g: 3.0, magnesiumPer100g: 200, zincPer100g: 3.0, potassiumPer100g: 500 },
  { id: 'f65', name: 'Walnuts', category: 'fat_nuts', kcalPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65, servingSizeG: 30, fiberPer100g: 6.7, vitaminCPer100g: 1.3, vitaminDPer100g: 0, calciumPer100g: 98, ironPer100g: 2.9, magnesiumPer100g: 158, zincPer100g: 3.1, potassiumPer100g: 441 },
  { id: 'f66', name: 'Cashews', category: 'fat_nuts', kcalPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44, servingSizeG: 30, fiberPer100g: 3.3, vitaminCPer100g: 0, vitaminDPer100g: 0, calciumPer100g: 34, ironPer100g: 6.0, magnesiumPer100g: 252, zincPer100g: 5.6, potassiumPer100g: 548 },
  { id: 'f67', name: 'Chia Seeds', category: 'fat_nuts', kcalPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31, servingSizeG: 20, fiberPer100g: 34.4, vitaminCPer100g: 1.6, vitaminDPer100g: 0, calciumPer100g: 631, ironPer100g: 7.7, magnesiumPer100g: 335, zincPer100g: 4.6, potassiumPer100g: 407 },
  { id: 'f68', name: 'Flax Seeds', category: 'fat_nuts', kcalPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42, servingSizeG: 15, fiberPer100g: 27.3, vitaminCPer100g: 0.6, vitaminDPer100g: 0, calciumPer100g: 255, ironPer100g: 5.7, magnesiumPer100g: 392, zincPer100g: 4.3, potassiumPer100g: 813 },

  // Fats — whole foods
  { id: 'f69', name: 'Avocado', category: 'fruit', kcalPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 15, servingSizeG: 100, fiberPer100g: 6.7, vitaminCPer100g: 10, vitaminDPer100g: 0, calciumPer100g: 12, ironPer100g: 0.6, magnesiumPer100g: 29, zincPer100g: 0.6, potassiumPer100g: 485 },
  { id: 'f70', name: 'Cheddar Cheese', category: 'eggs_dairy', kcalPer100g: 403, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33, servingSizeG: 40, fiberPer100g: 0, vitaminCPer100g: 0, vitaminDPer100g: 0.5, calciumPer100g: 720, ironPer100g: 0.2, magnesiumPer100g: 20, zincPer100g: 2.6, potassiumPer100g: 82 },

  // Vegetables
  { id: 'f71', name: 'Broccoli', category: 'vegetable', kcalPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, servingSizeG: 100, fiberPer100g: 2.6, vitaminCPer100g: 89.2, vitaminDPer100g: 0, calciumPer100g: 47, ironPer100g: 0.7, magnesiumPer100g: 21, zincPer100g: 0.4, potassiumPer100g: 316 },
  { id: 'f72', name: 'Spinach', category: 'vegetable', kcalPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, servingSizeG: 100, fiberPer100g: 2.2, vitaminCPer100g: 28.1, vitaminDPer100g: 0, calciumPer100g: 99, ironPer100g: 2.7, magnesiumPer100g: 79, zincPer100g: 0.5, potassiumPer100g: 558 },
  { id: 'f73', name: 'Mixed Salad Greens', category: 'vegetable', kcalPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, servingSizeG: 100, fiberPer100g: 1.5, vitaminCPer100g: 15, vitaminDPer100g: 0, calciumPer100g: 35, ironPer100g: 1.0, magnesiumPer100g: 20, zincPer100g: 0.3, potassiumPer100g: 200 },
  { id: 'f74', name: 'Cucumber', category: 'vegetable', kcalPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, servingSizeG: 100, fiberPer100g: 0.5, vitaminCPer100g: 2.8, vitaminDPer100g: 0, calciumPer100g: 16, ironPer100g: 0.3, magnesiumPer100g: 13, zincPer100g: 0.2, potassiumPer100g: 147 },
  { id: 'f75', name: 'Tomato', category: 'vegetable', kcalPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, servingSizeG: 100, fiberPer100g: 1.2, vitaminCPer100g: 13.7, vitaminDPer100g: 0, calciumPer100g: 10, ironPer100g: 0.3, magnesiumPer100g: 11, zincPer100g: 0.2, potassiumPer100g: 237 },
  { id: 'f76', name: 'Bell Pepper', category: 'vegetable', kcalPer100g: 26, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, servingSizeG: 100, fiberPer100g: 2.1, vitaminCPer100g: 127.7, vitaminDPer100g: 0, calciumPer100g: 10, ironPer100g: 0.3, magnesiumPer100g: 12, zincPer100g: 0.2, potassiumPer100g: 211 },
  { id: 'f77', name: 'Carrot', category: 'vegetable', kcalPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, servingSizeG: 100, fiberPer100g: 2.8, vitaminCPer100g: 5.9, vitaminDPer100g: 0, calciumPer100g: 33, ironPer100g: 0.3, magnesiumPer100g: 12, zincPer100g: 0.2, potassiumPer100g: 320 },
  { id: 'f78', name: 'Onion', category: 'vegetable', kcalPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9, fatPer100g: 0.1, servingSizeG: 100, fiberPer100g: 1.7, vitaminCPer100g: 7.4, vitaminDPer100g: 0, calciumPer100g: 23, ironPer100g: 0.2, magnesiumPer100g: 10, zincPer100g: 0.2, potassiumPer100g: 146 },
  { id: 'f79', name: 'Garlic', category: 'vegetable', kcalPer100g: 149, proteinPer100g: 6.4, carbsPer100g: 33, fatPer100g: 0.5, servingSizeG: 10, fiberPer100g: 2.1, vitaminCPer100g: 31.2, vitaminDPer100g: 0, calciumPer100g: 181, ironPer100g: 1.7, magnesiumPer100g: 25, zincPer100g: 1.2, potassiumPer100g: 401 },
  { id: 'f80', name: 'Mushrooms', category: 'vegetable', kcalPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3, servingSizeG: 100, fiberPer100g: 1.0, vitaminCPer100g: 2.1, vitaminDPer100g: 0.1, calciumPer100g: 3, ironPer100g: 0.5, magnesiumPer100g: 9, zincPer100g: 0.5, potassiumPer100g: 318 },
  { id: 'f81', name: 'Zucchini', category: 'vegetable', kcalPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, servingSizeG: 100, fiberPer100g: 1.0, vitaminCPer100g: 17.9, vitaminDPer100g: 0, calciumPer100g: 16, ironPer100g: 0.4, magnesiumPer100g: 18, zincPer100g: 0.3, potassiumPer100g: 261 },
  { id: 'f82', name: 'Green Beans', category: 'vegetable', kcalPer100g: 31, proteinPer100g: 1.8, carbsPer100g: 7, fatPer100g: 0.2, servingSizeG: 100, fiberPer100g: 2.7, vitaminCPer100g: 12.2, vitaminDPer100g: 0, calciumPer100g: 37, ironPer100g: 1.0, magnesiumPer100g: 25, zincPer100g: 0.2, potassiumPer100g: 209 },
  { id: 'f83', name: 'Cauliflower', category: 'vegetable', kcalPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3, servingSizeG: 100, fiberPer100g: 2.0, vitaminCPer100g: 48.2, vitaminDPer100g: 0, calciumPer100g: 22, ironPer100g: 0.4, magnesiumPer100g: 15, zincPer100g: 0.3, potassiumPer100g: 299 },
  { id: 'f84', name: 'Asparagus', category: 'vegetable', kcalPer100g: 20, proteinPer100g: 2.2, carbsPer100g: 4, fatPer100g: 0.1, servingSizeG: 100, fiberPer100g: 2.1, vitaminCPer100g: 5.6, vitaminDPer100g: 0, calciumPer100g: 24, ironPer100g: 2.1, magnesiumPer100g: 14, zincPer100g: 0.5, potassiumPer100g: 202 },
  { id: 'f85', name: 'Frozen Mixed Vegetables', category: 'vegetable', kcalPer100g: 45, proteinPer100g: 2.5, carbsPer100g: 8, fatPer100g: 0.3, servingSizeG: 150, fiberPer100g: 4.0, vitaminCPer100g: 10, vitaminDPer100g: 0, calciumPer100g: 30, ironPer100g: 0.8, magnesiumPer100g: 20, zincPer100g: 0.4, potassiumPer100g: 220 },
];

export async function seedFoodDatabase(): Promise<void> {
  const count = await db.foodItems.count();
  if (count > 0) return;
  await db.foodItems.bulkAdd(DEFAULT_FOODS);
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const lower = query.toLowerCase();
  const all = await db.foodItems.toArray();
  return all.filter((f) => f.name.toLowerCase().includes(lower));
}

export async function getFoodsByCategory(category: string): Promise<FoodItem[]> {
  return db.foodItems.where('category').equals(category).toArray();
}

export async function getAllFoods(): Promise<FoodItem[]> {
  return db.foodItems.toArray();
}

export function computeEntry(food: FoodItem, grams: number): FoodEntry {
  const ratio = grams / 100;
  const r = (v?: number) => v !== undefined ? Math.round(v * ratio * 10) / 10 : undefined;
  return {
    foodId: food.id,
    foodName: food.name,
    grams,
    kcal: Math.round(food.kcalPer100g * ratio),
    protein: Math.round(food.proteinPer100g * ratio * 10) / 10,
    carbs: Math.round(food.carbsPer100g * ratio * 10) / 10,
    fat: Math.round(food.fatPer100g * ratio * 10) / 10,
    fiber: r(food.fiberPer100g),
    sugar: r(food.sugarPer100g),
    vitaminA: r(food.vitaminAPer100g),
    vitaminC: r(food.vitaminCPer100g),
    vitaminD: r(food.vitaminDPer100g),
    vitaminE: r(food.vitaminEPer100g),
    vitaminK: r(food.vitaminKPer100g),
    vitaminB12: r(food.vitaminB12Per100g),
    folate: r(food.folatePer100g),
    calcium: r(food.calciumPer100g),
    iron: r(food.ironPer100g),
    magnesium: r(food.magnesiumPer100g),
    zinc: r(food.zincPer100g),
    potassium: r(food.potassiumPer100g),
    selenium: r(food.seleniumPer100g),
    sodium: r(food.sodiumPer100g),
    omega3: r(food.omega3Per100g),
  };
}

// ---------------------------------------------------------------------------
// Meal logs
// ---------------------------------------------------------------------------

export async function saveMeal(
  date: string,
  mealName: string,
  entries: FoodEntry[],
): Promise<MealLog> {
  const totals = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
      fiber: acc.fiber + (e.fiber ?? 0),
      vitaminC: acc.vitaminC + (e.vitaminC ?? 0),
      vitaminD: acc.vitaminD + (e.vitaminD ?? 0),
      calcium: acc.calcium + (e.calcium ?? 0),
      iron: acc.iron + (e.iron ?? 0),
      magnesium: acc.magnesium + (e.magnesium ?? 0),
      zinc: acc.zinc + (e.zinc ?? 0),
      potassium: acc.potassium + (e.potassium ?? 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, vitaminC: 0, vitaminD: 0, calcium: 0, iron: 0, magnesium: 0, zinc: 0, potassium: 0 },
  );

  const meal: MealLog = {
    id: uuid(),
    date,
    mealName,
    entries,
    totalKcal: totals.kcal,
    totalProtein: Math.round(totals.protein * 10) / 10,
    totalCarbs: Math.round(totals.carbs * 10) / 10,
    totalFat: Math.round(totals.fat * 10) / 10,
    totalFiber: Math.round(totals.fiber * 10) / 10,
    totalVitaminC: Math.round(totals.vitaminC * 10) / 10,
    totalVitaminD: Math.round(totals.vitaminD * 10) / 10,
    totalCalcium: Math.round(totals.calcium * 10) / 10,
    totalIron: Math.round(totals.iron * 10) / 10,
    totalMagnesium: Math.round(totals.magnesium * 10) / 10,
    totalZinc: Math.round(totals.zinc * 10) / 10,
    totalPotassium: Math.round(totals.potassium * 10) / 10,
    createdAt: Date.now(),
  };

  await db.mealLogs.add(meal);
  return meal;
}

export async function getMealsForDate(date: string): Promise<MealLog[]> {
  return db.mealLogs.where('date').equals(date).toArray();
}

export async function deleteMeal(id: string): Promise<void> {
  await db.mealLogs.delete(id);
}

// ---------------------------------------------------------------------------
// Weight tracking
// ---------------------------------------------------------------------------

export async function saveWeightLog(
  date: string,
  weightKg: number,
  bodyFatPercent?: number,
  waistCm?: number,
  notes?: string,
): Promise<WeightLog> {
  const existing = await db.weightLogs.where('date').equals(date).toArray();
  if (existing.length > 0) {
    const entry = existing[0];
    const updated = { ...entry, weightKg, bodyFatPercent, waistCm, notes };
    await db.weightLogs.put(updated);
    return updated;
  }

  const entry: WeightLog = {
    id: uuid(),
    date,
    weightKg,
    bodyFatPercent,
    waistCm,
    notes,
    createdAt: Date.now(),
  };
  await db.weightLogs.add(entry);
  return entry;
}

export async function getWeightLogs(days: number = 90): Promise<WeightLog[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const all = await db.weightLogs.toArray();
  return all.filter((w) => w.date >= cutoffStr).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getLatestWeight(): Promise<WeightLog | null> {
  const all = await db.weightLogs.toArray();
  if (all.length === 0) return null;
  all.sort((a, b) => b.date.localeCompare(a.date));
  return all[0];
}

export function computeWeightTrend(logs: WeightLog[]): { date: string; weight: number; trend: number }[] {
  if (logs.length === 0) return [];

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map((w) => w.weightKg);

  // Exponential moving average (alpha = 0.3 for ~7-day half-life)
  const alpha = 0.3;
  let ema = weights[0];
  const trend: number[] = [ema];
  for (let i = 1; i < weights.length; i++) {
    ema = alpha * weights[i] + (1 - alpha) * ema;
    trend.push(Math.round(ema * 100) / 100);
  }

  return sorted.map((w, i) => ({
    date: w.date,
    weight: w.weightKg,
    trend: trend[i],
  }));
}

// ---------------------------------------------------------------------------
// Meal templates
// ---------------------------------------------------------------------------

const TEMPLATES_KEY = 'mos_meal_templates';
import type { MealTemplate } from '../models/food-item';

export function getTemplates(): MealTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveTemplate(name: string, entries: FoodEntry[]): MealTemplate {
  const templates = getTemplates();
  const t: MealTemplate = { id: uuid(), name, entries: [...entries] };
  templates.push(t);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  return t;
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates().filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

const DEFAULT_TEMPLATES: MealTemplate[] = [
  {
    id: 'default-1',
    name: 'High Protein Breakfast',
    entries: [
      { foodId: 'f21', foodName: 'Greek Yogurt 0%', grams: 200, kcal: 118, protein: 20, carbs: 7.2, fat: 0.4, fiber: 0, vitaminC: 0, vitaminD: 0, calcium: 220, iron: 0.2, magnesium: 22, zinc: 1.0, potassium: 282 },
      { foodId: 'f28', foodName: 'Whey Protein', grams: 30, kcal: 119, protein: 24, carbs: 2.1, fat: 1.5, fiber: 0, vitaminC: 0, vitaminD: 0, calcium: 36, iron: 0.2, magnesium: 15, zinc: 0.5, potassium: 45 },
      { foodId: 'f35', foodName: 'Oats', grams: 50, kcal: 190, protein: 6.8, carbs: 34, fat: 3.3, fiber: 5.3, vitaminC: 0, vitaminD: 0, calcium: 27, iron: 2.4, magnesium: 88.5, zinc: 1.5, potassium: 181 },
      { foodId: 'f55', foodName: 'Strawberries', grams: 100, kcal: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2.0, vitaminC: 58.8, vitaminD: 0, calcium: 16, iron: 0.4, magnesium: 13, zinc: 0.1, potassium: 153 },
    ],
  },
  {
    id: 'default-2',
    name: 'Lean Lunch',
    entries: [
      { foodId: 'f1', foodName: 'Chicken Breast', grams: 150, kcal: 248, protein: 46.5, carbs: 0, fat: 5.4, fiber: 0, vitaminC: 0, vitaminD: 0.2, calcium: 16.5, iron: 1.1, magnesium: 40.5, zinc: 1.2, potassium: 384 },
      { foodId: 'f32', foodName: 'White Rice (cooked)', grams: 200, kcal: 260, protein: 5.4, carbs: 56, fat: 0.6, fiber: 0.8, vitaminC: 0, vitaminD: 0, calcium: 20, iron: 0.4, magnesium: 24, zinc: 0.8, potassium: 70 },
      { foodId: 'f71', foodName: 'Broccoli', grams: 100, kcal: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, vitaminC: 89.2, vitaminD: 0, calcium: 47, iron: 0.7, magnesium: 21, zinc: 0.4, potassium: 316 },
    ],
  },
  {
    id: 'default-3',
    name: 'Post-Workout',
    entries: [
      { foodId: 'f14', foodName: 'Cod', grams: 150, kcal: 123, protein: 27, carbs: 0, fat: 1.1, fiber: 0, vitaminC: 0, vitaminD: 1.4, calcium: 15, iron: 0.3, magnesium: 36, zinc: 0.6, potassium: 435 },
      { foodId: 'f43', foodName: 'Potato (boiled)', grams: 200, kcal: 174, protein: 3.8, carbs: 40, fat: 0.2, fiber: 2.8, vitaminC: 14.8, vitaminD: 0, calcium: 12, iron: 0.6, magnesium: 38, zinc: 0.6, potassium: 688 },
    ],
  },
];

export function seedTemplates(): void {
  const existing = getTemplates();
  if (existing.length > 0) return;
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES));
}

export function computeRateOfChange(logs: WeightLog[]): number {
  const points = computeWeightTrend(logs);
  if (points.length < 3) return 0;
  const first = points[0];
  const last = points[points.length - 1];
  const days = Math.max(
    (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24),
    1,
  );
  const changePerDay = (last.trend - first.trend) / days;
  return Math.round(changePerDay * 7 * 100) / 100;
}
