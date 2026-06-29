export interface FoodItem {
  id: string;
  name: string;
  category: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingSizeG: number;
  barcode?: string;
  // Micronutrients (per 100g)
  fiberPer100g?: number;
  sugarPer100g?: number;
  vitaminAPer100g?: number;   // mcg RAE
  vitaminCPer100g?: number;   // mg
  vitaminDPer100g?: number;   // mcg
  vitaminEPer100g?: number;   // mg
  vitaminKPer100g?: number;   // mcg
  vitaminB12Per100g?: number; // mcg
  folatePer100g?: number;     // mcg
  calciumPer100g?: number;    // mg
  ironPer100g?: number;       // mg
  magnesiumPer100g?: number;  // mg
  zincPer100g?: number;       // mg
  potassiumPer100g?: number;  // mg
  seleniumPer100g?: number;   // mcg
  sodiumPer100g?: number;     // mg
  omega3Per100g?: number;     // g
}

export interface FoodEntry {
  foodId: string;
  foodName: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  // Computed micronutrients (from ratio * per100g)
  fiber?: number;
  sugar?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminB12?: number;
  folate?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  zinc?: number;
  potassium?: number;
  selenium?: number;
  sodium?: number;
  omega3?: number;
}

export interface MealTemplate {
  id: string;
  name: string;
  entries: FoodEntry[];
}
