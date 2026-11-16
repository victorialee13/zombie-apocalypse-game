"use client";

import { useEffect } from "react";
import { applyBrightness, applyTextSize, loadSettings } from "../game/settings";

// Applies the saved brightness and text size when the game first opens
export default function BrightnessSync() {
  useEffect(() => {
    const settings = loadSettings();
    applyBrightness(settings.brightness);
    applyTextSize(settings.textSize);
  }, []);

  return null;
}
