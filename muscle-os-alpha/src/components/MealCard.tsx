import type { MealLog } from '../models/meal-log';

interface MealCardProps {
  meal: MealLog;
  onDelete?: (id: string) => void;
}

export function MealCard({ meal, onDelete }: MealCardProps) {
  return (
    <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-200">{meal.mealName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{meal.totalKcal} kcal</span>
          {onDelete && (
            <button
              onClick={() => onDelete(meal.id)}
              className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-3 mb-2 text-xs text-zinc-400">
        <span>P {meal.totalProtein}g</span>
        <span>C {meal.totalCarbs}g</span>
        <span>F {meal.totalFat}g</span>
      </div>
      <div className="space-y-1">
        {meal.entries.map((entry, i) => (
          <div key={i} className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              {entry.grams}g {entry.foodName}
            </span>
            <span>
              {entry.kcal} kcal
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
