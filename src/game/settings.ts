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

export function applyBrightness(value: number) {
  document.documentElement.style.setProperty("--brightness", String(0.5 + value / 110));
}
