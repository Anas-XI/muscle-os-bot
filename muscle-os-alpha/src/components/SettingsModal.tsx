import { useState } from 'react';
import { loadSettings, saveSettings, type LmStudioSettings } from '../config/lm-studio';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SettingsModal({ open, onClose, onSave }: Props) {
  const initial = loadSettings();
  const [url, setUrl] = useState(initial.baseUrl);
  const [model, setModel] = useState(initial.model);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    const settings: LmStudioSettings = {
      baseUrl: url.replace(/\/+$/, ''),
      model: model.trim(),
    };
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSave();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm mx-4 p-5 shadow-2xl">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4">LM Studio Settings</h2>

        <label className="block text-[11px] text-zinc-500 mb-1 ml-1">Server URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:1234/v1"
          className="w-full bg-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-emerald-600 mb-3 transition-colors placeholder:text-zinc-600"
        />

        <label className="block text-[11px] text-zinc-500 mb-1 ml-1">Model Name</label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="gemma-4-4b-it"
          className="w-full bg-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-emerald-600 mb-4 transition-colors placeholder:text-zinc-600"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!url.trim() || !model.trim()}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              saved
                ? 'bg-emerald-600 text-white scale-95'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-zinc-800 disabled:text-zinc-600'
            }`}
          >
            {saved ? '✓ Saved' : 'Save & Reconnect'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
