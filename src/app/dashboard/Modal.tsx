import type { ReactNode } from "react";

/*
 * --t is one design pixel for anything drawn over the dashboard: the dashboard's --u, shrunk when
 * compact since --u there is measured against a smaller design. Spacing classes inside count in --t.
 */
export const OVERLAY_SCALE =
  "[--spacing:var(--t)] [--t:var(--u)] compact:[--t:calc(var(--u)*0.75)] narrow:[--t:calc(var(--u)*0.85)]";

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
};

// A centered card over the dimmed dashboard; must be rendered inside the dashboard so --u is defined
export default function Modal({ width, label, title, children }: ModalProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-12 ${OVERLAY_SCALE}`}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex max-h-[calc(100dvh-24px)] max-w-[calc(100vw-24px)] flex-col gap-16 overflow-y-auto px-36 pt-28 pb-28 ${CARD}`}
        style={{ width: `calc(${width} * var(--t))` }}
      >
        <span className={LABEL}>{label}</span>
        <h2 id="modal-title" className="-mt-4 font-display text-[length:calc(40*var(--t))] leading-[1.05]">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
