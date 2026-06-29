import { useState, useEffect, useRef } from 'react';
import type { FoodItem, FoodEntry } from '../models/food-item';
import { searchFoods, computeEntry } from '../services/nutrition-service';

interface FoodSearchProps {
  onAddEntry: (entry: FoodEntry) => void;
}

export function FoodSearch({ onAddEntry }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState('100');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchFoods(query);
      setResults(res.slice(0, 10));
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setQuery('');
    setResults([]);
    setGrams(String(food.servingSizeG));
    setIsOpen(true);
  };

  const handleAdd = () => {
    if (!selectedFood) return;
    const g = parseFloat(grams);
    if (isNaN(g) || g <= 0) return;
    const entry = computeEntry(selectedFood, g);
    onAddEntry(entry);
    setSelectedFood(null);
    setGrams('100');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {!selectedFood && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food..."
            className="w-full bg-zinc-800 text-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none border border-zinc-700 focus:border-emerald-600 transition-colors placeholder:text-zinc-600"
          />
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden z-10 shadow-xl">
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelect(food)}
                  className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-between"
                >
                  <span>{food.name}</span>
                  <span className="text-xs text-zinc-500">{food.kcalPer100g} kcal/100g</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedFood && (
        <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-200">{selectedFood.name}</span>
            <button
              onClick={() => { setSelectedFood(null); setIsOpen(false); }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Change
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="w-20 bg-zinc-900 text-zinc-200 rounded-lg px-3 py-1.5 text-sm outline-none border border-zinc-600 focus:border-emerald-600"
              min="1"
              step="5"
            />
            <span className="text-sm text-zinc-400">grams</span>
            <span className="text-xs text-zinc-500 ml-auto">
              {(() => {
                const g = parseFloat(grams);
                if (isNaN(g)) return '';
                const r = g / 100;
                return `${Math.round(selectedFood.kcalPer100g * r)} kcal`;
              })()}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add to Meal
          </button>
        </div>
      )}
    </div>
  );
}
