"use client";

import { useEffect } from "react";
import { applyMusicVolume, playMusic } from "../game/music";
import { loadSettings } from "../game/settings";

// Starts the background music with the saved volume when the game first opens
export default function MusicSync() {
  useEffect(() => {
    applyMusicVolume(loadSettings());

    // If autoplay is blocked, start on the player's first click or key press instead
    const start = () => {
      playMusic().catch(() => {});
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
    playMusic().catch(() => {
      window.addEventListener("pointerdown", start);
      window.addEventListener("keydown", start);
    });

    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  return null;
}
