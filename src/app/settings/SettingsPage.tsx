"use client";

import { useEffect, useState } from "react";
import Button from "../../components/Button";
import Panel from "../../components/Panel";

type Settings = {
  masterVolume: number;
  music: number;
  soundEffects: number;
  difficulty: string;
  textSpeed: string;
  brightness: number;
  textSize: string;
};

const DEFAULT_SETTINGS: Settings = {
  masterVolume: 80,
  music: 60,
  soundEffects: 90,
  difficulty: "Standard",
  textSpeed: "Normal",
  brightness: 55,
  textSize: "Medium",
};

const STORAGE_KEY = "zombie-settings";

function loadSettings(): Settings {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
}

type SettingsPageProps = {
  onBack?: () => void;
};

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // localStorage only exists in the browser, so load saved settings after mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update(key: keyof Settings, value: number | string) {
    setSettings({ ...settings, [key]: value });
  }

  function apply() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function reset() {
    setSettings(DEFAULT_SETTINGS);
  }

  function slider(label: string, key: keyof Settings) {
    return (
      <label className="flex flex-col gap-3 text-[19px]">
        <div className="flex justify-between">
          <span>{label}</span>
          <span className="font-mono text-[13px] text-muted">{settings[key]}%</span>
        </div>
        <input
          type="range"
          className="w-full accent-blood"
          min={0}
          max={100}
          value={settings[key]}
          onChange={(e) => update(key, Number(e.target.value))}
        />
      </label>
    );
  }

  function choices(label: string, key: keyof Settings, options: string[]) {
    return (
      <div className="flex flex-col gap-3 text-[19px]">
        <span>{label}</span>
        <div className="flex gap-[3px] rounded border border-line bg-panel-2 p-[3px]">
          {options.map((option) => (
            <button
              key={option}
              className={`flex-1 cursor-pointer rounded-[3px] px-2.5 py-2 text-base/[normal] ${
                settings[key] === option ? "bg-blood text-fg" : "text-muted"
              }`}
              onClick={() => update(key, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center gap-9 bg-vignette px-24 py-11">
      <header className="flex items-center justify-between">
        <Button onClick={onBack}>← Back</Button>
        <h1 className="font-display text-[88px]">Settings</h1>
        <div className="w-25" />
      </header>

      <div className="grid grid-cols-3 gap-6">
        <Panel title="Audio">
          {slider("Master volume", "masterVolume")}
          {slider("Music", "music")}
          {slider("Sound effects", "soundEffects")}
        </Panel>

        <Panel title="Gameplay">
          {choices("Difficulty", "difficulty", ["Survivor", "Standard", "Nightmare"])}
          <p className="-mt-2 text-sm/[normal] text-muted">
            Changes starting supplies, event severity, and how fast the horde adapts.
          </p>
          {choices("Text speed", "textSpeed", ["Slow", "Normal", "Instant"])}
        </Panel>

        <Panel title="Display & Access">
          {slider("Brightness", "brightness")}
          {choices("Text size", "textSize", ["Small", "Medium", "Large"])}
        </Panel>
      </div>

      <footer className="flex justify-end gap-3">
        <Button onClick={reset}>Reset to Default</Button>
        <Button variant="primary" className="min-w-[200px]" onClick={apply}>
          Apply
        </Button>
      </footer>
    </div>
  );
}
