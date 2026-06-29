import { db } from '../database/db';
import { computeWeightTrend, computeRateOfChange } from './nutrition-service';

export interface NutritionSnapshot {
  recentProteinAvg: number | null;
  recentCaloriesAvg: number | null;
  weightTrend: string | null;
  rateOfChange: string | null;
  daysTracked: number;
  summary: string;
}

export async function getNutritionSnapshot(): Promise<NutritionSnapshot> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get recent weight logs
  const weightLogs = await db.weightLogs
    .where('date')
    .between(sevenDaysAgo.toISOString().slice(0, 10), now.toISOString().slice(0, 10))
    .toArray();

  // Get recent meal logs
  const mealLogs = await db.mealLogs
    .where('date')
    .between(sevenDaysAgo.toISOString().slice(0, 10), now.toISOString().slice(0, 10))
    .toArray();

  // Compute weight trend
  let weightTrend: string | null = null;
  let rateOfChange: string | null = null;
  if (weightLogs.length >= 3) {
    const trend = computeWeightTrend(weightLogs);
    const roc = computeRateOfChange(weightLogs);
    const latest = trend[trend.length - 1];
    weightTrend = `${latest.trend.toFixed(1)} kg (trend)`;
    rateOfChange = `${roc.toFixed(2)} kg/week`;
  }

  // Compute average daily protein and calories
  const dailyTotals = new Map<string, { protein: number; calories: number }>();
  for (const meal of mealLogs) {
    const existing = dailyTotals.get(meal.date) ?? { protein: 0, calories: 0 };
    dailyTotals.set(meal.date, {
      protein: existing.protein + meal.totalProtein,
      calories: existing.calories + meal.totalKcal,
    });
  }

  let recentProteinAvg: number | null = null;
  let recentCaloriesAvg: number | null = null;
  if (dailyTotals.size > 0) {
    const totals = [...dailyTotals.values()];
    recentProteinAvg = Math.round(totals.reduce((s, d) => s + d.protein, 0) / totals.length);
    recentCaloriesAvg = Math.round(totals.reduce((s, d) => s + d.calories, 0) / totals.length);
  }

  // Build human summary
  const parts: string[] = [];
  if (weightTrend) parts.push(`Weight trend: ${weightTrend} (${rateOfChange})`);
  if (recentProteinAvg) parts.push(`Avg protein (7d): ${recentProteinAvg}g/day`);
  if (recentCaloriesAvg) parts.push(`Avg calories (7d): ${recentCaloriesAvg}/day`);
  parts.push(`Days tracked: ${Math.max(weightLogs.length, dailyTotals.size)}`);

  return {
    recentProteinAvg,
    recentCaloriesAvg,
    weightTrend,
    rateOfChange,
    daysTracked: Math.max(weightLogs.length, dailyTotals.size),
    summary: parts.join(' | '),
  };
}
