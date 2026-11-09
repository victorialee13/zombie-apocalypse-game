"use client";

import { useCallback, useEffect, useState } from "react";
import { DURATION, PEEK_DURATION, nextDelay, playScream } from "../game/jumpscare";
import { loadSettings } from "../game/settings";

// An original zombie face, drawn rather than loaded so there's no image asset
function ZombieFace({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="skin" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#8a9a6a" />
          <stop offset="70%" stopColor="#4d5a38" />
          <stop offset="100%" stopColor="#1f2616" />
        </radialGradient>
        <radialGradient id="eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6c8" />
          <stop offset="35%" stopColor="#e8d24a" />
          <stop offset="100%" stopColor="#3a0a06" />
        </radialGradient>
      </defs>
      {/* Head */}
      <path d="M100 8 C40 8 18 60 22 112 C26 170 52 228 100 232 C148 228 174 170 178 112 C182 60 160 8 100 8 Z" fill="url(#skin)" />
      {/* Wounds and veins */}
      <path d="M48 52 L70 70 M60 44 L66 74 M150 150 Q160 170 148 188" stroke="#5a1410" strokeWidth="3" fill="none" />
      <ellipse cx="148" cy="64" rx="14" ry="9" fill="#5a1410" opacity="0.8" />
      {/* Sunken sockets */}
      <ellipse cx="68" cy="104" rx="30" ry="24" fill="#0d0f08" />
      <ellipse cx="132" cy="104" rx="30" ry="24" fill="#0d0f08" />
      <circle cx="70" cy="106" r="11" fill="url(#eye)" />
      <circle cx="130" cy="106" r="11" fill="url(#eye)" />
      <circle cx="70" cy="106" r="3" fill="#000" />
      <circle cx="130" cy="106" r="3" fill="#000" />
      {/* Nose cavity */}
      <path d="M100 124 L90 148 L110 148 Z" fill="#0d0f08" />
      {/* Gaping mouth with jagged teeth */}
      <path d="M52 166 Q100 150 148 166 Q140 222 100 226 Q60 222 52 166 Z" fill="#1a0504" />
      <path d="M58 168 L66 186 L74 166 L82 190 L90 162 L98 186 L106 162 L114 190 L122 164 L130 186 L140 166 L144 172 Q100 156 58 168 Z" fill="#d8cfa8" />
      <path d="M66 214 L74 198 L82 216 L92 196 L102 218 L112 198 L122 216 L132 200 L138 210 Q100 232 66 214 Z" fill="#c4b98e" />
      {/* Blood drips */}
      <path d="M76 190 L78 206 L80 190 M118 192 L120 212 L122 192" stroke="#8b0f0a" strokeWidth="3" />
    </svg>
  );
}

export type ScareMode = "full" | "corner";

export function scareMode(jumpscares: string): ScareMode {
  return jumpscares === "On" ? "full" : "corner";
}

// One scare: a full-screen lunge with a scream, or (jumpscares off) a quiet peek from the bottom corner
export function ZombieScare({ mode, onDone }: { mode: ScareMode; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, mode === "full" ? DURATION : PEEK_DURATION);
    return () => clearTimeout(timer);
  }, [mode, onDone]);

  if (mode === "corner") {
    // Doesn't block clicks, so it never interrupts a decision
    return (
      <div className="pointer-events-none fixed right-[2vw] bottom-0 z-100 animate-zombie-peek">
        <ZombieFace className="h-[22dvh] min-h-[110px]" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-100 flex cursor-pointer items-center justify-center bg-black/90"
      onClick={onDone}
    >
      <div className="animate-jumpscare">
        <ZombieFace className="h-[85dvh] max-w-[90vw]" />
      </div>
    </div>
  );
}

type JumpscareProps = {
  active: boolean; // only scare while a game is in progress
};

// Schedules scares at random while playing, in whichever form the settings ask for
export default function Jumpscare({ active }: JumpscareProps) {
  const [mode, setMode] = useState<ScareMode | null>(null);
  const done = useCallback(() => setMode(null), []);

  useEffect(() => {
    if (!active || mode) return;
    const timer = setTimeout(() => {
      const settings = loadSettings();
      const next = scareMode(settings.jumpscares);
      if (next === "full") playScream(settings);
      setMode(next);
    }, nextDelay());
    return () => clearTimeout(timer);
  }, [active, mode]);

  return mode ? <ZombieScare mode={mode} onDone={done} /> : null;
}
