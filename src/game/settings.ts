export type Settings = {
  masterVolume: number;
  music: number;
  soundEffects: number;
  difficulty: string;
  textSpeed: string;
  brightness: number;
  textSize: string;
  muteAll: string;
  confirmDecisions: string;
  jumpscares: string;
};

export const DEFAULT_SETTINGS: Settings = {
  masterVolume: 80,
  music: 60,
  soundEffects: 90,
  difficulty: "Standard",
  textSpeed: "Normal",
  brightness: 55,
  textSize: "Medium",
  muteAll: "Off",
  confirmDecisions: "On",
  jumpscares: "On",
};

const STORAGE_KEY = "zombie-settings";

export function loadSettings(): Settings {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_SETTINGS;

  const settings: Settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  return settings;
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const TEXT_SCALE: Record<string, number> = { Small: 0.9, Medium: 1, Large: 1.15 };

// Scales everything drawn over the dashboard: events, night reports, the tutorial and the pause menu
export function applyTextSize(size: string) {
  document.documentElement.style.setProperty("--text-scale", String(TEXT_SCALE[size] ?? 1));
}

// Milliseconds per letter when story text is typed out; 0 shows it all at once
const TEXT_DELAY: Record<string, number> = { Slow: 40, Normal: 14, Instant: 0 };

export function textDelay(speed: string) {
  return TEXT_DELAY[speed] ?? TEXT_DELAY.Normal;
}

export function applyBrightness(value: number) {
  document.documentElement.style.setProperty("--brightness", String(0.5 + value / 110));
}
