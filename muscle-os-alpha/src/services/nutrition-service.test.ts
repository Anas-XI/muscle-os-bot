import { describe, it, expect } from 'vitest';
import { calculateBmr, calculateNutrition } from './nutrition-service';

describe('calculateBmr', () => {
  it('calculates male BMR correctly (Mifflin-St Jeor)', () => {
    const bmr = calculateBmr(80, 175, 30, 'male');
    // (10*80) + (6.25*175) - (5*30) + 5 = 800 + 1093.75 - 150 + 5 = 1748.75
    expect(bmr).toBe(1748.75);
  });

  it('calculates female BMR correctly', () => {
    const bmr = calculateBmr(65, 165, 30, 'female');
    // (10*65) + (6.25*165) - (5*30) - 161 = 650 + 1031.25 - 150 - 161 = 1370.25
    expect(bmr).toBe(1370.25);
  });
});

describe('calculateNutrition', () => {
  it('returns a NutritionPlan with all required fields', () => {
    const plan = calculateNutrition(80, 175, 30, 'male', 'moderate', 'recomp', 'intermediate');
    expect(plan).toBeDefined();
    expect(plan.tdee).toBeGreaterThan(0);
    expect(plan.targetCalories).toBeGreaterThan(0);
    expect(plan.proteinG).toBeGreaterThan(0);
    expect(plan.fatG).toBeGreaterThan(0);
    expect(plan.carbsG).toBeGreaterThan(0);
    expect(plan.proteinPerKg).toBeGreaterThan(0);
    expect(plan.fatPerKg).toBeGreaterThan(0);
    expect(plan.carbsPerKg).toBeGreaterThan(0);
    expect(plan.bmr).toBeGreaterThan(0);
    expect(plan.adjustmentLabel).toBeDefined();
    expect(plan.goal).toBe('recomp');
    expect(plan.profile).toBe('intermediate');
  });

  it('calculates deficit for fat loss goal', () => {
    const plan = calculateNutrition(80, 175, 30, 'male', 'moderate', 'fat_loss', 'intermediate');
    expect(plan.adjustmentLabel).toContain('deficit');
    expect(plan.targetCalories).toBeLessThan(plan.tdee);
  });

  it('calculates surplus for hypertrophy goal', () => {
    const plan = calculateNutrition(80, 175, 30, 'male', 'moderate', 'hypertrophy', 'intermediate');
    expect(plan.targetCalories).toBeGreaterThan(plan.tdee);
  });

  it('respects custom calorie target when provided', () => {
    const plan = calculateNutrition(80, 175, 30, 'male', 'moderate', 'recomp', 'intermediate', 2500);
    expect(plan.targetCalories).toBe(2500);
  });

  it('calculates protein based on profile', () => {
    const plan = calculateNutrition(80, 175, 30, 'male', 'moderate', 'recomp', 'advanced');
    expect(plan.proteinPerKg).toBeCloseTo(2.2, 1);
    expect(plan.proteinG).toBeGreaterThan(140);
  });
});
