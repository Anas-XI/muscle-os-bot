import { useState, useEffect, useCallback } from 'react';
import type { FoodEntry, MealTemplate } from '../models/food-item';
import type { MealLog, NutritionPlan } from '../models/meal-log';
import {
  calculateNutrition,
  seedFoodDatabase,
  getMealsForDate,
  saveMeal,
  deleteMeal,
  getTemplates,
  saveTemplate,
  deleteTemplate,
  seedTemplates,
} from '../services/nutrition-service';
import { FoodSearch } from '../components/FoodSearch';
import { MealCard } from '../components/MealCard';
import { CalorieDashboard } from '../components/CalorieDashboard';
import { WeightSection } from '../components/WeightSection';

type Tab = 'tracker' | 'calculator';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function CalorieScreen() {
  const [tab, setTab] = useState<Tab>('tracker');
  const [date] = useState(todayStr());
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [currentMealName, setCurrentMealName] = useState('Breakfast');
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // Calculator form state
  const [weightCalc, setWeightCalc] = useState('80');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('recomp');
  const [profile, setProfile] = useState('intermediate');
  const [planResult, setPlanResult] = useState<NutritionPlan | null>(null);

  useEffect(() => {
    seedFoodDatabase();
    seedTemplates();
    setTemplates(getTemplates());
  }, []);

  const loadMeals = useCallback(async () => {
    const m = await getMealsForDate(date);
    setMeals(m);
  }, [date]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  useEffect(() => {
    const saved = localStorage.getItem('mos_nutrition_plan');
    if (saved) {
      try { setPlan(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleAddEntry = (entry: FoodEntry) => {
    setEntries((prev) => [...prev, entry]);
  };

  const handleSaveMeal = async () => {
    if (entries.length === 0) return;
    await saveMeal(date, currentMealName, entries);
    setEntries([]);
    await loadMeals();
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal(id);
    await loadMeals();
  };

  const handleLoadTemplate = (t: MealTemplate) => {
    setEntries(t.entries);
    setShowTemplates(false);
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim() || entries.length === 0) return;
    saveTemplate(templateName.trim(), entries);
    setTemplates(getTemplates());
    setTemplateName('');
    setShowSaveTemplate(false);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setTemplates(getTemplates());
  };

  const handleCalculate = () => {
    const result = calculateNutrition(
      parseFloat(weightCalc), parseFloat(height), parseInt(age),
      sex, activity, goal, profile,
    );
    setPlanResult(result);
    setPlan(result);
    localStorage.setItem('mos_nutrition_plan', JSON.stringify(result));
  };

  const totals = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.totalKcal,
      protein: acc.protein + m.totalProtein,
      carbs: acc.carbs + m.totalCarbs,
      fat: acc.fat + m.totalFat,
      fiber: acc.fiber + (m.totalFiber ?? 0),
      vitaminC: acc.vitaminC + (m.totalVitaminC ?? 0),
      vitaminD: acc.vitaminD + (m.totalVitaminD ?? 0),
      calcium: acc.calcium + (m.totalCalcium ?? 0),
      iron: acc.iron + (m.totalIron ?? 0),
      magnesium: acc.magnesium + (m.totalMagnesium ?? 0),
      zinc: acc.zinc + (m.totalZinc ?? 0),
      potassium: acc.potassium + (m.totalPotassium ?? 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, vitaminC: 0, vitaminD: 0, calcium: 0, iron: 0, magnesium: 0, zinc: 0, potassium: 0 },
  );

  const targets = plan
    ? { kcal: plan.targetCalories, protein: plan.proteinG, carbs: plan.carbsG, fat: plan.fatG, fiber: 25, vitaminC: 90, vitaminD: 15, calcium: 1000, iron: plan.sex === 'female' ? 18 : 8, magnesium: 420, zinc: 11, potassium: 3400 }
    : { kcal: 2500, protein: 160, carbs: 300, fat: 80, fiber: 25, vitaminC: 90, vitaminD: 15, calcium: 1000, iron: 8, magnesium: 420, zinc: 11, potassium: 3400 };

  const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h1 className="text-sm font-semibold text-zinc-200">Calorie Tracker</h1>
        </div>
      </header>

      <div className="flex border-b border-zinc-800 shrink-0">
        <button
          onClick={() => setTab('tracker')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'tracker'
              ? 'text-emerald-400 border-b-2 border-emerald-500'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Food Log
        </button>
        <button
          onClick={() => setTab('calculator')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'calculator'
              ? 'text-emerald-400 border-b-2 border-emerald-500'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Calculator
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {tab === 'tracker' && (
          <>
            <WeightSection />
            <CalorieDashboard current={totals} targets={targets} />

            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
            ))}

            {/* Add meal */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-700 p-3 space-y-3">
              <div className="flex gap-2">
                {mealNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setCurrentMealName(name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentMealName === name
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowTemplates(!showTemplates); setShowSaveTemplate(false); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Templates
                </button>
                {entries.length > 0 && (
                  <button
                    onClick={() => { setShowSaveTemplate(!showSaveTemplate); setShowTemplates(false); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Save as Template
                  </button>
                )}
              </div>

              {showTemplates && templates.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {templates.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                      <button
                        onClick={() => handleLoadTemplate(t)}
                        className="flex-1 text-left text-xs text-zinc-300 hover:text-zinc-100"
                      >
                        {t.name}
                        <span className="text-zinc-500 ml-2">
                          ({t.entries.length} items, ~{t.entries.reduce((s, e) => s + e.kcal, 0)} kcal)
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(t.id)}
                        className="text-xs text-zinc-600 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showSaveTemplate && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Template name..."
                    className="flex-1 bg-zinc-800 text-zinc-200 rounded-lg px-3 py-1.5 text-xs outline-none border border-zinc-700 focus:border-emerald-600 placeholder:text-zinc-600"
                  />
                  <button
                    onClick={handleSaveAsTemplate}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}

              <FoodSearch onAddEntry={handleAddEntry} />

              {entries.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-zinc-500 font-medium">Current meal:</div>
                  {entries.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-800 rounded-lg px-3 py-1.5">
                      <span>{e.grams}g {e.foodName}</span>
                      <span>{e.kcal} kcal</span>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveMeal}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Save {currentMealName}
                    </button>
                    <button
                      onClick={() => setEntries([])}
                      className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'calculator' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-700 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-200">TDEE & Macro Calculator</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Weight (kg)</label>
                  <input type="number" value={weightCalc} onChange={(e) => setWeightCalc(e.target.value)}
                    className="w-full bg-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-emerald-600" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Height (cm)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-emerald-600" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-emerald-600" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Sex</label>
                  <select value={sex} onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                    className="w-full bg-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-emerald-600">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Activity</label>
                  <select value={activity} onChange={(e) => setActivity(e.target.value)}
                    className="w-full bg-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-emerald-600">
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light (1-3x/wk)</option>
                    <option value="moderate">Moderate (3-5x/wk)</option>
                    <option value="active">Active (6-7x/wk)</option>
                    <option value="very_active">Very Active (2x/day)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Goal</label>
                  <select value={goal} onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-emerald-600">
                    <option value="fat_loss">Fat Loss</option>
                    <option value="recomp">Recomp</option>
                    <option value="hypertrophy">Hypertrophy</option>
                    <option value="strength">Strength</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-500 block mb-1">Profile</label>
                  <select value={profile} onChange={(e) => setProfile(e.target.value)}
                    className="w-full bg-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-emerald-600">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="busy">Busy</option>
                    <option value="advanced">Advanced</option>
                    <option value="masters">Masters</option>
                  </select>
                </div>
              </div>

              <button onClick={handleCalculate}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors">
                Calculate
              </button>
            </div>

            {planResult && (
              <div className="bg-zinc-800 rounded-xl border border-emerald-700 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-emerald-400">Your Nutrition Plan</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-400">Target</span><span className="text-zinc-200 font-medium">{planResult.targetCalories} kcal ({planResult.adjustmentLabel})</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Protein</span><span className="text-zinc-200">{planResult.proteinG}g ({planResult.proteinPerKg.toFixed(1)} g/kg)</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Carbs</span><span className="text-zinc-200">{planResult.carbsG}g ({planResult.carbsPerKg.toFixed(1)} g/kg)</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Fat</span><span className="text-zinc-200">{planResult.fatG}g ({planResult.fatPerKg.toFixed(1)} g/kg)</span></div>
                  <div className="border-t border-zinc-700 my-2" />
                  <div className="flex justify-between text-xs text-zinc-500"><span>BMR</span><span>{planResult.bmr} kcal</span></div>
                  <div className="flex justify-between text-xs text-zinc-500"><span>TDEE</span><span>{planResult.tdee} kcal</span></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
