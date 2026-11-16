"use client";

import { useEffect } from "react";

// Spread onto overlays (pause menu, tutorial) so game shortcuts don't fire behind them
export const BLOCKS_SHORTCUTS = { "data-blocks-shortcuts": "" };

// Maps keys (e.key, lowercase) to actions while the calling screen is showing
export function useShortcuts(handlers: Record<string, () => void>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector("[data-blocks-shortcuts]")) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      // Enter on a focused button already presses that button
      if (e.key === "Enter" && target?.closest("button, a")) return;

      const handler = handlers[e.key.toLowerCase()];
      if (!handler) return;
      e.preventDefault();
      handler();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}
