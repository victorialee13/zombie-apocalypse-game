import type { ColorStatus } from "../../game/colors";

// Tailwind only generates classes it can find written out in full, so each tone maps to complete class names
export const TEXT_TONE: Record<ColorStatus, string> = {
  green: "text-green",
  amber: "text-amber",
  red: "text-blood",
  blue: "text-blue",
  purple: "text-purple",
};

export const FILL_TONE: Record<ColorStatus, string> = {
  green: "bg-green",
  amber: "bg-amber",
  red: "bg-blood",
  blue: "bg-blue",
  purple: "bg-purple",
};

export const BORDER_TONE: Record<ColorStatus, string> = {
  green: "border-green",
  amber: "border-amber",
  red: "border-blood",
  blue: "border-blue",
  purple: "border-purple",
};

export const CARD_TONE: Record<ColorStatus, string> = {
  green: "border-line",
  amber: "border-amber/70",
  red: "border-blood/70",
  blue: "border-line",
  purple: "border-line",
};

export const CHIP_TONE: Record<ColorStatus, string> = {
  green: "border-green/60 bg-green/16 text-green",
  amber: "border-amber/60 bg-amber/16 text-amber",
  red: "border-blood/60 bg-blood/16 text-blood",
  blue: "border-blue/60 bg-blue/16 text-blue",
  purple: "border-purple/60 bg-purple/16 text-purple",
};
