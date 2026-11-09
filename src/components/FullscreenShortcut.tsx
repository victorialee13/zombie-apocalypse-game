"use client";

import { useEffect } from "react";
import { toggleFullscreen } from "./FullscreenButton";

// F toggles fullscreen on every screen of the game
export default function FullscreenShortcut() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "f" || e.repeat) return;
      // Leave browser shortcuts like Ctrl+F alone
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Don't steal the letter while the player is typing
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === "TEXTAREA") return;
      if (target instanceof HTMLInputElement && target.type !== "range" && target.type !== "checkbox") return;

      toggleFullscreen();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
