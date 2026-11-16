"use client";

import type { ReactNode } from "react";

/*
 * --t is one design pixel for anything drawn over the dashboard: the dashboard's --u, shrunk when
 * compact since --u there is measured against a smaller design. Spacing classes inside count in --t.
 */
export const OVERLAY_SCALE =
  // --text-scale is the Text size setting, so Large grows the whole card along with its text
  "[--spacing:var(--t)] [--t:calc(var(--u)*var(--text-scale,1))] compact:[--t:calc(var(--u)*0.75*var(--text-scale,1))] narrow:[--t:calc(var(--u)*0.85*var(--text-scale,1))]";

export const CARD = "rounded-lg border border-blood/70 bg-panel shadow-[0_20px_60px_rgb(0_0_0/0.6)]";

export const LABEL = "font-label text-[length:calc(12*var(--t))] tracking-[0.14em] text-amber";
export const BODY = "text-[length:calc(17*var(--t))] leading-[1.5]";
export const NOTE_TITLE = "text-[length:calc(16*var(--t))]";
export const NOTE_TEXT = "text-[length:calc(13*var(--t))] leading-[1.35] text-muted";
export const BUTTON = "min-h-0 px-[1.1em] py-[0.45em] text-[length:calc(17*var(--t))]";

type ModalProps = {
  width: number; // in design pixels
  label: string;
  title: string;
  children: ReactNode;
  // Shows an X that hides the card so the player can check the dashboard; the dashboard's main button brings it back
  onClose?: () => void;
  hidden?: boolean; // the card's owner stays mounted while hidden, so choices made so far are kept
};

// A centered card over the dimmed dashboard; must be rendered inside the dashboard so --u is defined
export default function Modal({ width, label, title, children, onClose, hidden }: ModalProps) {
  if (hidden) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-12 ${OVERLAY_SCALE}`}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex max-h-[calc(100dvh-24px)] max-w-[calc(100vw-24px)] flex-col gap-16 overflow-y-auto px-36 pt-28 pb-28 ${CARD}`}
        style={{ width: `calc(${width} * var(--t))` }}
      >
        <div className="flex items-center justify-between gap-16">
          <span className={LABEL}>{label}</span>
          {onClose && (
            <button
              aria-label="Close"
              title="Close (reopen it from the dashboard)"
              // The ::after box widens the tap target without changing how the X looks
              className="relative size-22 shrink-0 cursor-pointer text-muted transition-colors after:absolute after:-inset-11 hover:text-fg"
              onClick={onClose}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-full">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
        <h2 id="modal-title" className="-mt-4 font-display text-[length:calc(40*var(--t))] leading-[1.05]">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
