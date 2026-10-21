"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Button from "../../components/Button";
import type { ColorStatus } from "../../game/colors";
import { STATUS_COLOR, firstNameByRole, type Status, type Survivor } from "../../game/survivors";
import { BODY, BUTTON, CARD, LABEL, NOTE_TEXT, NOTE_TITLE, OVERLAY_SCALE } from "./Modal";
import { CHIP_TONE, FILL_TONE } from "./tones";

const SEEN_KEY = "zombie-tutorial-seen";

// Which side of the highlighted element the popover sits on
type Side = "right" | "bottom" | "top";

type Step = {
  target?: string; // matches a data-tour attribute on the dashboard; no target means a centered modal
  side?: Side;
  width: number; // in design pixels
  title: string;
  content?: ReactNode;
};

type Layout = {
  spot: { left: number; top: number; width: number; height: number } | null;
  popover: { left: number; top: number } | null;
  side: Side;
  arrow: number;
};

const CHIP_STATUSES: Status[] = ["Healthy", "Hungry", "Exhausted", "Sick", "Injured"];

// Clip-path triangles pointing back at the highlighted element
const ARROW: Record<Side, string> = {
  right: "-left-10 h-16 w-10 -translate-y-1/2 [clip-path:polygon(100%_0,0_50%,100%_100%)]",
  bottom: "-top-10 h-10 w-16 -translate-x-1/2 [clip-path:polygon(50%_0,100%_100%,0_100%)]",
  top: "-bottom-10 h-10 w-16 -translate-x-1/2 [clip-path:polygon(0_0,100%_0,50%_100%)]",
};

function Dot({ tone }: { tone: ColorStatus }) {
  return <span className={`mt-[0.45em] size-7 shrink-0 rounded-full ${FILL_TONE[tone]}`} />;
}

function Note({ tone, title, children }: { tone: ColorStatus; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-10">
      <Dot tone={tone} />
      <div className="flex flex-col gap-2">
        <span className={NOTE_TITLE}>{title}</span>
        <span className={NOTE_TEXT}>{children}</span>
      </div>
    </li>
  );
}

function Beat({ n, tone, title, children }: { n: number; tone: ColorStatus; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 rounded border border-line bg-panel-2 p-12">
      <div className="flex items-center gap-8">
        <span
          className={`flex size-22 items-center justify-center rounded-full font-label text-[length:calc(12*var(--t))] text-bg ${FILL_TONE[tone]}`}
        >
          {n}
        </span>
        <span className={NOTE_TITLE}>{title}</span>
      </div>
      <span className={NOTE_TEXT}>{children}</span>
    </div>
  );
}

function Rule({ tone, title, children }: { tone: ColorStatus; title: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-16 rounded border border-line bg-panel-2 px-20 py-12 text-left">
      <span className={`size-9 shrink-0 rounded-full ${FILL_TONE[tone]}`} />
      <div className="flex flex-col gap-2">
        <span className="text-[length:calc(19*var(--t))]">{title}</span>
        <span className={NOTE_TEXT}>{children}</span>
      </div>
    </li>
  );
}

function buildSteps(survivors: Survivor[]): Step[] {
  return [
    { width: 580, title: "Welcome to The Shelter" },
    {
      target: "supplies",
      side: "right",
      width: 380,
      title: "Watch your supplies",
      content: (
        <>
          <p className={BODY}>
            Everything the shelter needs comes from these four stores. Each bar shows how long it will last.
          </p>
          <ul className="flex flex-col gap-10">
            <Note tone="amber" title="Food & Water">
              Everyone eats and drinks every day. Run out and health drops fast.
            </Note>
            <Note tone="red" title="Medicine">
              Rare. Save it for the sick and injured.
            </Note>
            <Note tone="green" title="Weapons & Ammo">
              Used up when you defend the shelter at night.
            </Note>
          </ul>
        </>
      ),
    },
    {
      target: "survivors",
      side: "bottom",
      width: 510,
      title: "Know your survivors",
      content: (
        <>
          <p className={BODY}>
            Each card shows a survivor’s job, health, and condition. A colored border means someone needs help today.
          </p>
          <div className="flex flex-wrap gap-6">
            {CHIP_STATUSES.map((status) => (
              <span
                key={status}
                className={`rounded-[3px] border px-[0.7em] py-[0.27em] font-label text-[length:calc(10.7*var(--t))] tracking-[0.08em] ${CHIP_TONE[STATUS_COLOR[status]]}`}
              >
                {status.toUpperCase()}
              </span>
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-16">
            <Note tone="red" title="When someone dies, they’re gone">
              You can’t bring anyone back. Losing one hurts the whole group.
            </Note>
            <Note tone="blue" title="Roles matter">
              {firstNameByRole(survivors, "Medic")} is your only medic. {firstNameByRole(survivors, "Ex-Soldier")} and{" "}
              {firstNameByRole(survivors, "Guard")} are your best defenders.
            </Note>
          </ul>
        </>
      ),
    },
    {
      target: "begin-day",
      side: "top",
      width: 454,
      title: "Starting the day",
      content: (
        <>
          <p className={BODY}>
            Press Begin Day when you’re ready. Every day follows the same three beats following different scenarios.
          </p>
          <div className="grid grid-cols-3 gap-8">
            <Beat n={1} tone="amber" title="Event">
              Something goes wrong.
            </Beat>
            <Beat n={2} tone="blue" title="Choose">
              Pick A, B, or C. Each has a cost.
            </Beat>
            <Beat n={3} tone="red" title="Night">
              Supplies drop. The horde tests you.
            </Beat>
          </div>
          <p className="text-[length:calc(14*var(--t))] text-amber">
            Read each choice’s cost before you confirm. Choices can’t be undone.
          </p>
        </>
      ),
    },
    {
      width: 740,
      title: "Good Luck...",
      content: (
        <>
          <p className="text-[length:calc(19*var(--t))] text-fg/80">
          </p>
          <ul className="flex flex-col gap-12">
            <Rule tone="amber" title="Keep the stores stocked">
              No food or water means health drops every day.
            </Rule>
            <Rule tone="red" title="Protect the vulnerable">
              Sick and injured survivors get worse if ignored.
            </Rule>
            <Rule tone="blue" title="Think before you choose">
              Every choice costs something. There’s no undo.
            </Rule>
          </ul>
        </>
      ),
    },
  ];
}

/*
 * Places the popover on the preferred side of the target, falling back to whichever other side fits,
 * then keeps it on screen. Sizes are in real pixels; k is real pixels per design pixel.
 */
function measure(target: DOMRect, popover: HTMLElement, preferred: Side, k: number): Layout {
  const pad = 6 * k; // how far the highlight sits outside the target
  const gap = pad + 10 * k; // leaves room for the arrow
  const margin = 12 * k;
  const w = popover.offsetWidth;
  const h = popover.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spots: Record<Side, { left: number; top: number; fits: boolean }> = {
    right: { left: target.right + gap, top: target.top - pad, fits: target.right + gap + w <= vw - margin },
    bottom: { left: target.right + pad - w, top: target.bottom + gap, fits: target.bottom + gap + h <= vh - margin },
    top: { left: target.right + pad - w, top: target.top - gap - h, fits: target.top - gap - h >= margin },
  };
  const order: Side[] = [preferred, "bottom", "top", "right"];
  const side = order.find((s) => spots[s].fits) ?? preferred;
  const left = Math.max(margin, Math.min(spots[side].left, vw - w - margin));
  const top = Math.max(margin, Math.min(spots[side].top, vh - h - margin));

  // Beside the target the arrow sits near the top; above or below it points at the middle of the overlap
  let arrow: number;
  if (side === "right") {
    arrow = Math.max(20 * k, Math.min(target.top + 36 * k - top, h - 20 * k));
  } else {
    const overlap = (Math.max(left, target.left) + Math.min(left + w, target.right)) / 2;
    arrow = Math.max(24 * k, Math.min(overlap - left, w - 24 * k));
  }

  return {
    spot: { left: target.left - pad, top: target.top - pad, width: target.width + pad * 2, height: target.height + pad * 2 },
    popover: { left, top },
    side,
    arrow,
  };
}

type OnboardingProps = {
  survivors: Survivor[];
  onBeginDay?: () => void;
};

export default function Onboarding({ survivors, onBeginDay }: OnboardingProps) {
  const [step, setStep] = useState<number | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const steps = buildSteps(survivors);
  const current = step === null ? null : steps[step];
  const last = steps.length - 1;

  // Shown the first time the dashboard opens, or again whenever How to Play links here with ?tutorial
  useEffect(() => {
    const replay = new URLSearchParams(window.location.search).has("tutorial");
    if (replay || !localStorage.getItem(SEEN_KEY)) setStep(0);
  }, []);

  // Keyed on step rather than current, since the steps are rebuilt every render
useLayoutEffect(() => {
  if (step === null) return;
  const current = buildSteps([])[step];
  let frame = 0;
  let prev = "";

  function update() {
    const popover = popoverRef.current;
    if (popover) {
      const target = current.target ? document.querySelector(`[data-tour="${current.target}"]`) : null;
      const next: Layout = target
        ? measure(target.getBoundingClientRect(), popover, current.side ?? "bottom", popover.offsetWidth / current.width)
        : { spot: null, popover: null, side: "bottom", arrow: 0 };
      const key = JSON.stringify(next);
      if (key !== prev) {
        prev = key;
        setLayout(next);
      }
    }
    frame = requestAnimationFrame(update);
  }

  update();
  return () => cancelAnimationFrame(frame);
}, [step]);

  function close() {
    localStorage.setItem(SEEN_KEY, "1");
    setStep(null);
    setLayout(null);
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  }

  function next() {
    if (step === null) return;
    if (step < last) setStep(step + 1);
    else {
      close();
      onBeginDay?.();
    }
  }

  function back() {
    if (step) setStep(step - 1);
  }

  useEffect(() => {
    if (step === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" && step < last) setStep(step + 1);
      else if (e.key === "ArrowLeft" && step > 0) setStep(step - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (step === null || !current) return null;

  const centered = !current.target;
  const anchored = layout?.popover;

  const dots = (
    <div className="flex items-center gap-5">
      {steps.map((_, i) => (
        <span
          key={i}
          className={`h-7 rounded-full transition-all duration-300 ${
            i === step ? "w-22 bg-blood" : `w-7 ${i < step ? "bg-muted" : "bg-line"}`
          }`}
        />
      ))}
    </div>
  );

  const popover = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className={`flex max-w-[calc(100vw-24px)] flex-col gap-16 ${CARD} ${
        centered ? "items-stretch px-40 pt-32 pb-28 text-center" : "absolute p-24"
      }`}
      style={{
        width: `calc(${current.width} * var(--t))`,
        ...(anchored ? { left: anchored.left, top: anchored.top } : {}),
        // Hidden for the first frame, until we know where it goes
        visibility: centered || anchored ? "visible" : "hidden",
      }}
    >
      {anchored && layout && (
        <span
          className={`absolute bg-blood ${ARROW[layout.side]}`}
          style={layout.side === "right" ? { top: layout.arrow } : { left: layout.arrow }}
        />
      )}

      <span className={LABEL}>
        {step + 1} OF {steps.length}
      </span>
      <h2
        id="onboarding-title"
        className={`font-display leading-[1.05] ${
          centered ? "text-[length:calc(48*var(--t))]" : "text-[length:calc(32*var(--t))]"
        }`}
      >
        {current.title}
      </h2>
      {current.content}

      <div className={`flex items-center justify-between gap-16 border-t border-line pt-18 ${centered ? "mt-8" : ""}`}>
        {dots}
        <div className="flex items-center gap-8">
          {step === 0 ? (
            <button
              className="cursor-pointer px-12 text-[length:calc(16*var(--t))] text-fg/80 hover:text-fg"
              onClick={close}
            >
              Skip tutorial
            </button>
          ) : (
            <Button className={BUTTON} onClick={back}>
              Back
            </Button>
          )}
          <Button variant="primary" className={BUTTON} onClick={next}>
            {step === 0 ? "Show me around" : step === last ? "Begin Day 1" : "Next"}&nbsp;&nbsp;→
          </Button>
        </div>
      </div>

      {step === last && (
        <p className="text-[length:calc(13*var(--t))] text-muted">You can replay this from How to Play at any time.</p>
      )}
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 ${OVERLAY_SCALE}`}>
      {layout?.spot ? (
        // The huge shadow dims everything around the highlighted element
        <div
          className="absolute rounded-lg border-2 border-blood shadow-[0_0_0_200vmax_rgb(0_0_0/0.72)] transition-all duration-300"
          style={layout.spot}
        />
      ) : (
        <div className="absolute inset-0 bg-black/72" />
      )}

      {centered ? (
        <div className="absolute inset-0 flex items-center justify-center p-12">{popover}</div>
      ) : (
        popover
      )}
    </div>
  );
}
