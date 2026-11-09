"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

// Shared by the button and the F key shortcut
export function toggleFullscreen() {
  if (!document.fullscreenEnabled) return;
  const request = document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen();
  // The browser can refuse (e.g. a permissions policy); nothing changes then
  request.catch(() => {});
}

type FullscreenButtonProps = {
  className?: string;
};

// Toggles the whole page in and out of fullscreen. Hidden where the browser can't do it (e.g. iPhone Safari)
export default function FullscreenButton({ className }: FullscreenButtonProps) {
  const [supported, setSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setSupported(document.fullscreenEnabled);
    const sync = () => setIsFullscreen(document.fullscreenElement !== null);
    sync();
    // Also fires when the player leaves fullscreen with Esc or the browser's own controls
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  if (!supported) return null;

  const label = isFullscreen ? "Exit fullscreen" : "Enter fullscreen";

  return (
    <button
      aria-label={label}
      aria-keyshortcuts="F"
      title={`${label} (F)`}
      className={twMerge("cursor-pointer text-muted transition-colors hover:text-fg", className)}
      onClick={toggleFullscreen}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-full"
      >
        {isFullscreen ? (
          // Corners pointing inward
          <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
        ) : (
          // Corners pointing outward
          <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
        )}
      </svg>
    </button>
  );
}
