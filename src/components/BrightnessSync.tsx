"use client";

import { useEffect } from "react";
import { applyBrightness, loadSettings } from "../game/settings";

// Applies the saved brightness when the game first opens
export default function BrightnessSync() {
  useEffect(() => {
    applyBrightness(loadSettings().brightness);
  }, []);

  return null;
}
