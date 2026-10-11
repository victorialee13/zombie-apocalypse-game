"use client";

import { useEffect, useState } from "react";
import "./SettingsPage.css";

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
      <label className="control">
        <div className="control-row">
          <span>{label}</span>
          <span className="value">{settings[key]}%</span>
        </div>
        <input
          type="range"
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
      <div className="control">
        <span>{label}</span>
        <div className="segmented">
          {options.map((option) => (
            <button
              key={option}
              className={settings[key] === option ? "selected" : ""}
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
    <div className="settings-page">
      <header className="settings-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <h1>Settings</h1>
        <div className="spacer" />
      </header>

      <div className="settings-sections">
        <section className="panel">
          <h2>Audio</h2>
          {slider("Master volume", "masterVolume")}
          {slider("Music", "music")}
          {slider("Sound effects", "soundEffects")}
        </section>

        <section className="panel">
          <h2>Gameplay</h2>
          {choices("Difficulty", "difficulty", ["Survivor", "Standard", "Nightmare"])}
          <p className="hint">
            Changes starting supplies, event severity, and how fast the horde adapts.
          </p>
          {choices("Text speed", "textSpeed", ["Slow", "Normal", "Instant"])}
        </section>

        <section className="panel">
          <h2>Display &amp; Access</h2>
          {slider("Brightness", "brightness")}
          {choices("Text size", "textSize", ["Small", "Medium", "Large"])}
        </section>
      </div>

      <footer className="settings-footer">
        <button className="btn btn-secondary" onClick={reset}>
          Reset to Default
        </button>
        <button className="btn btn-primary" onClick={apply}>
          Apply
        </button>
      </footer>
    </div>
  );
}
