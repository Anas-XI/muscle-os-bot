export interface LmStudioSettings {
  baseUrl: string;
  model: string;
}

const STORAGE_KEY = 'muscle-os-lm-studio-settings';

const DEFAULTS = {
  baseUrl: 'http://localhost:1234/v1',
  model: 'gemma-4-4b-it',
  defaultTemperature: 0.3,
  maxTokens: 2048,
};

export function loadSettings(): LmStudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LmStudioSettings>;
      return {
        baseUrl: parsed.baseUrl || DEFAULTS.baseUrl,
        model: parsed.model || DEFAULTS.model,
      };
    }
  } catch {
    // ignore corrupt localStorage
  }
  return { baseUrl: DEFAULTS.baseUrl, model: DEFAULTS.model };
}

export function saveSettings(s: LmStudioSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export const LM_STUDIO_CONFIG = {
  get baseUrl() {
    return loadSettings().baseUrl;
  },
  set baseUrl(_v: string) {
    // noop — use saveSettings()
  },
  get model() {
    return loadSettings().model;
  },
  set model(_v: string) {
    // noop — use saveSettings()
  },
  defaultTemperature: DEFAULTS.defaultTemperature,
  maxTokens: DEFAULTS.maxTokens,
};
