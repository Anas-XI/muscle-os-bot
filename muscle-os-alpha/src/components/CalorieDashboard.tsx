interface CalorieDashboardProps {
  current: { kcal: number; protein: number; carbs: number; fat: number; fiber: number; vitaminC: number; vitaminD: number; calcium: number; iron: number; magnesium: number; zinc: number; potassium: number };
  targets: { kcal: number; protein: number; carbs: number; fat: number; fiber: number; vitaminC: number; vitaminD: number; calcium: number; iron: number; magnesium: number; zinc: number; potassium: number };
}

function MacroBar({ label, current, target, unit, color }: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300 font-medium">
          {Math.round(current * 10) / 10}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-[10px] text-zinc-600 mt-0.5">{pct}%</div>
    </div>
  );
}

const MICRO_COLORS: Record<string, string> = {
  'Vit C': 'bg-orange-500',
  'Vit D': 'bg-yellow-400',
  Ca: 'bg-sky-400',
  Fe: 'bg-red-500',
  Mg: 'bg-purple-500',
  Zn: 'bg-cyan-500',
  K: 'bg-rose-400',
};

export function CalorieDashboard({ current, targets }: CalorieDashboardProps) {
  const kcalPct = targets.kcal > 0 ? Math.round((current.kcal / targets.kcal) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-zinc-200">Daily Totals</span>
          <div className="text-right">
            <span className={`text-lg font-bold ${kcalPct > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
              {current.kcal}
            </span>
            <span className="text-xs text-zinc-500 ml-1">/ {targets.kcal} kcal</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Macros</div>
            <MacroBar label="Protein" current={current.protein} target={targets.protein} unit="g" color="bg-emerald-500" />
            <MacroBar label="Carbs" current={current.carbs} target={targets.carbs} unit="g" color="bg-amber-500" />
            <MacroBar label="Fat" current={current.fat} target={targets.fat} unit="g" color="bg-blue-500" />
            <MacroBar label="Fiber" current={current.fiber} target={targets.fiber} unit="g" color="bg-lime-500" />
          </div>
          <div className="border-t border-zinc-700 pt-3">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-2">Key Micronutrients</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <MacroBar label="Vit C" current={current.vitaminC} target={targets.vitaminC} unit="mg" color="bg-orange-500" />
              <MacroBar label="Vit D" current={current.vitaminD} target={targets.vitaminD} unit="mcg" color="bg-yellow-400" />
              <MacroBar label="Calcium" current={current.calcium} target={targets.calcium} unit="mg" color="bg-sky-400" />
              <MacroBar label="Iron" current={current.iron} target={targets.iron} unit="mg" color="bg-red-500" />
              <MacroBar label="Magnesium" current={current.magnesium} target={targets.magnesium} unit="mg" color="bg-purple-500" />
              <MacroBar label="Zinc" current={current.zinc} target={targets.zinc} unit="mg" color="bg-cyan-500" />
              <MacroBar label="Potassium" current={current.potassium} target={targets.potassium} unit="mg" color="bg-rose-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
