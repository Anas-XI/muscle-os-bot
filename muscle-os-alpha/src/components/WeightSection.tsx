import { useState, useEffect, useCallback } from 'react';
import type { WeightLog } from '../models/meal-log';
import { saveWeightLog, getWeightLogs, computeWeightTrend, computeRateOfChange, getLatestWeight } from '../services/nutrition-service';

export function WeightSection() {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [trend, setTrend] = useState<{ date: string; weight: number; trend: number }[]>([]);
  const [roc, setRoc] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    const w = await getWeightLogs(90);
    setLogs(w);
    setTrend(computeWeightTrend(w));
    setRoc(computeRateOfChange(w));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getLatestWeight().then((w) => {
      if (w) setWeight(String(w.weightKg));
    });
  }, []);

  const handleSave = async () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    const today = new Date().toISOString().slice(0, 10);
    await saveWeightLog(
      today,
      w,
      bodyFat ? parseFloat(bodyFat) : undefined,
      waist ? parseFloat(waist) : undefined,
    );
    setWeight('');
    setBodyFat('');
    setWaist('');
    await load();
  };

  const minWeight = trend.length > 0 ? Math.min(...trend.map((t) => t.weight)) * 0.995 : 60;
  const maxWeight = trend.length > 0 ? Math.max(...trend.map((t) => t.weight)) * 1.005 : 100;
  const range = maxWeight - minWeight;

  return (
    <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-200">Weight</span>
          {roc !== 0 && (
            <span className={`text-xs font-medium ${roc < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {roc > 0 ? '+' : ''}{roc.toFixed(1)} kg/week
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {expanded ? 'Done' : 'Log'}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="h-24 relative">
          <svg viewBox={`0 0 ${trend.length * 20 + 40} 100`} className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((pct) => (
              <line key={pct} x1="0" y1={100 - pct * 80} x2={trend.length * 20 + 40} y2={100 - pct * 80}
                stroke="#27272a" strokeWidth="0.5" />
            ))}
            {/* Trend line */}
            <polyline
              points={trend.map((t, i) => `${20 + i * 20},${100 - ((t.trend - minWeight) / range) * 80}`).join(' ')}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Raw weight dots */}
            {trend.map((t, i) => {
              const x = 20 + i * 20;
              const y = 100 - ((t.weight - minWeight) / range) * 80;
              return <circle key={i} cx={x} cy={y} r="2" fill="#52525b" />;
            })}
            {/* Latest point */}
            {trend.length > 0 && (() => {
              const last = trend[trend.length - 1];
              const x = 20 + (trend.length - 1) * 20;
              const y = 100 - ((last.trend - minWeight) / range) * 80;
              return <circle cx={x} cy={y} r="4" fill="#22c55e" stroke="#09090b" strokeWidth="1.5" />;
            })()}
          </svg>
        </div>
      )}

      {logs.length === 0 && (
        <div className="text-xs text-zinc-500 text-center py-3">
          Start logging your weight daily to see your trend here
        </div>
      )}

      {expanded && (
        <div className="space-y-2 pt-1 border-t border-zinc-700">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-zinc-500 block mb-0.5">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-200 rounded-lg px-2 py-1.5 text-xs outline-none border border-zinc-600 focus:border-emerald-600" step="0.1" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-0.5">Body Fat %</label>
              <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-200 rounded-lg px-2 py-1.5 text-xs outline-none border border-zinc-600 focus:border-emerald-600" step="0.1" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-0.5">Waist (cm)</label>
              <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-200 rounded-lg px-2 py-1.5 text-xs outline-none border border-zinc-600 focus:border-emerald-600" step="0.5" />
            </div>
          </div>
          <button onClick={handleSave}
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors">
            Log Today
          </button>
        </div>
      )}

      {/* Recent entries */}
      {!expanded && logs.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>Latest: <strong className="text-zinc-300">{logs[logs.length - 1].weightKg} kg</strong></span>
          {logs.length >= 3 && (
            <span>Trend: <strong className="text-emerald-400">{trend[trend.length - 1]?.trend.toFixed(1)} kg</strong></span>
          )}
          <span>{logs.length} days</span>
        </div>
      )}
    </div>
  );
}
