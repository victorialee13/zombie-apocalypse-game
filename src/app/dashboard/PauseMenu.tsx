"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "../../components/Button";
import { applyMusicVolume } from "../../game/music";
import { applyBrightness, loadSettings, saveSettings, type Settings } from "../../game/settings";
import { BODY, BUTTON, CARD, LABEL, OVERLAY_SCALE } from "./Modal";

const TITLE = "text-center font-display text-[length:calc(44*var(--t))] leading-[1.05]";

type PauseMenuProps = {
  onResume: () => void;
  onHowToPlay: () => void;
};

// Opened by the header cog or Esc; sits above the day's event so a decision is never skipped
export default function PauseMenu({ onResume, onHowToPlay }: PauseMenuProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  // The run isn't saved yet, so leaving the dashboard waits for the player to confirm
  const [leavingTo, setLeavingTo] = useState<"/" | "/settings" | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (leavingTo) setLeavingTo(null);
      else onResume();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [leavingTo, onResume]);

  // Quick settings save immediately, into the same values the Settings page edits
  function update(key: "masterVolume" | "brightness" | "muteAll", value: number | string) {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
    if (key === "brightness") applyBrightness(Number(value));
    else applyMusicVolume(next);
  }

  function slider(label: string, key: "masterVolume" | "brightness") {
    if (!settings) return null;
    return (
      <label className="flex flex-col gap-6 text-[length:calc(18*var(--t))]">
        <span className="flex justify-between">
          <span>{label}</span>
          <span className="font-label text-[length:calc(12*var(--t))] text-muted">{settings[key]}%</span>
        </span>
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

  const muted = settings?.muteAll === "On";

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center bg-black/65 p-12 ${OVERLAY_SCALE}`}
      onClick={(e) => e.target === e.currentTarget && onResume()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        className={`flex max-h-[calc(100dvh-24px)] max-w-[calc(100vw-24px)] flex-col gap-16 overflow-y-auto px-32 py-28 ${CARD}`}
        style={{ width: "calc(440 * var(--t))" }}
      >
        {leavingTo ? (
          <>
            <h2 id="pause-title" className={TITLE}>
              Leave the shelter?
            </h2>
            <p className={`${BODY} text-muted`}>
              Your run isn’t saved yet. {leavingTo === "/settings" ? "Opening Settings" : "Going back to the main menu"}{" "}
              ends this run, and your survivors’ progress will be lost.
            </p>
            <div className="flex justify-end gap-12">
              <Button className={BUTTON} autoFocus onClick={() => setLeavingTo(null)}>
                Stay
              </Button>
              <Button variant="primary" className={BUTTON} onClick={() => router.push(leavingTo)}>
                Leave
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id="pause-title" className={TITLE}>
              Paused
            </h2>
            <Button variant="primary" className={`${BUTTON} w-full`} autoFocus onClick={onResume}>
              Resume
            </Button>

            <section className="flex flex-col gap-14 rounded border border-line bg-panel-2 p-16">
              <span className={LABEL}>QUICK SETTINGS</span>
              <button
                role="switch"
                aria-checked={muted}
                className="flex cursor-pointer items-center justify-between text-[length:calc(18*var(--t))]"
                onClick={() => update("muteAll", muted ? "Off" : "On")}
              >
                <span>Mute all</span>
                <span className={`relative h-22 w-40 rounded-full transition-colors ${muted ? "bg-blood" : "bg-line"}`}>
                  <span
                    className={`absolute top-3 size-16 rounded-full transition-[left] ${
                      muted ? "left-21 bg-fg" : "left-3 bg-muted"
                    }`}
                  />
                </span>
              </button>
              {slider("Master volume", "masterVolume")}
              {slider("Brightness", "brightness")}
            </section>

            <div className="grid grid-cols-2 gap-12">
              <Button className={BUTTON} onClick={onHowToPlay}>
                How to Play
              </Button>
              <Button className={BUTTON} onClick={() => setLeavingTo("/settings")}>
                Settings
              </Button>
            </div>

            <div className="flex items-center justify-between gap-12 border-t border-line pt-16">
              {/* Outlined rather than solid red, so it reads as a warning and doesn't compete with Resume */}
              <Button
                className={`${BUTTON} border-blood/70 bg-blood/16 text-fg`}
                onClick={() => setLeavingTo("/")}
              >
                ←&nbsp;&nbsp;Main Menu
              </Button>
              {/* Touch screens have no Esc key, so the hint only shows with a mouse */}
              <span className="flex items-center gap-8 text-[length:calc(15*var(--t))] text-muted pointer-coarse:hidden">
                <kbd className="rounded-[3px] border border-line px-7 py-2 font-label text-[length:calc(12*var(--t))]">
                  Esc
                </kbd>
                to resume
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
