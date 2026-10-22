"use client";

import { useEffect, useState, type ReactNode } from "react";
import Button from "../../components/Button";
import type { ColorStatus } from "../../game/colors";
import { TOTAL_DAYS } from "../../game/rules";
import {
  SUPPLY_IDS,
  SUPPLY_INFO,
  isLow,
  usageAmount,
  type SupplyId,
  type Supplies,
} from "../../game/supplies";
import { LOW_HEALTH, STATUS_COLOR, isAlive, type Survivor } from "../../game/survivors";
import Onboarding from "./Onboarding";
import PauseMenu from "./PauseMenu";
import { BORDER_TONE, CARD_TONE, CHIP_TONE, FILL_TONE, TEXT_TONE } from "./tones";

const ROW = "flex items-center justify-between gap-8";
const HEADING =
  "font-display text-[length:calc(34*var(--u))] tracking-[0.02em] compact:text-[length:calc(20*var(--u))]";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function percent(value: number, max: number) {
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function describeSupply(id: SupplyId, amount: number, aliveCount: number) {
  const info = SUPPLY_INFO[id];
  const low = isLow(id, amount);
  const perUse = usageAmount(id, aliveCount);
  const per = info.usage.per;
  const color: ColorStatus = low ? "red" : info.color;

  let note = "";
  if (low) {
    note = "LOW";
  } else if (perUse > 0) {
    const lasts = Math.round((amount / perUse) * 10) / 10;
    note = `≈ ${lasts} ${per}${lasts === 1 ? "" : "s"}`;
  }

  return {
    name: info.name,
    amountText: `${amount} ${info.unit}`,
    color,
    fill: percent(amount, info.capacity),
    note,
    low,
    usageText: `−${perUse} / ${per}`,
  };
}

function Bar({ value, tone, thin }: { value: number; tone: ColorStatus; thin?: boolean }) {
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-line ${
        thin ? "h-6 compact:h-4" : "h-8 compact:h-5"
      }`}
    >
      <div
        className={`h-full rounded-[inherit] transition-[width] duration-300 ease-[ease] ${FILL_TONE[tone]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function useDisableZoom() {
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "=", "-", "_", "0"].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("gesturestart", preventDefault);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("gesturestart", preventDefault);
    };
  }, []);
}

// Same gear as the Figma mockup (Lucide "settings")
function CogIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-full">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

type DashboardPageProps = {
  day: number;
  supplies: Supplies;
  survivors: Survivor[];
  onBeginDay?: () => void;
  children?: ReactNode; // overlays like the day's event, rendered inside so they share the screen's scale
};

export default function DashboardPage({ day, supplies, survivors, onBeginDay, children }: DashboardPageProps) {
  useDisableZoom();
  const [paused, setPaused] = useState(false);
  // Bumped by the pause menu's How to Play to replay the tutorial without leaving the run
  const [tutorialRuns, setTutorialRuns] = useState(0);

  // Esc opens the pause menu; the menu handles Esc itself once open. The tutorial claims Esc first.
  useEffect(() => {
    if (paused) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) setPaused(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paused]);

  const alive = survivors.filter(isAlive);
  const needAttention = alive.filter((s) => s.status !== "Healthy").length;

  /*
   * The whole screen scales with the window: --u is one design pixel (the design is 1440x800,
   * 800x480 when compact, 390x750 when narrow). Pointing --spacing at it makes every spacing
   * class on this page count in design pixels, so p-20 is 20 design pixels.
   */
  return (
    <div className="flex h-dvh touch-pan-x touch-pan-y flex-col overflow-hidden bg-vignette [--spacing:var(--u)] [--u:min(calc(100vw/1440),calc(100dvh/800))] compact:[--u:min(calc(100vw/800),calc(100dvh/480))] narrow:[--u:min(calc(100vw/390),calc(100dvh/750))]">
      <header className="flex shrink-0 items-center justify-between gap-16 border border-line bg-panel px-36 py-20 compact:px-12 compact:py-10">
        <div className="flex gap-[0.35em] font-display text-[length:calc(52*var(--u))] compact:text-[length:calc(26*var(--u))]">
          <span>DAY {String(day).padStart(2, "0")}</span>
          <span className="text-muted">/ {TOTAL_DAYS}</span>
        </div>

        <div className="flex items-center gap-24 compact:gap-12">
          <div className="flex w-200 flex-col gap-6 compact:w-150 compact:gap-4">
            <div
              className={`${ROW} font-label text-[length:calc(13.5*var(--u))] compact:text-[length:calc(10*var(--u))]`}
            >
              <span className="tracking-[0.1em] whitespace-nowrap text-muted">SURVIVORS ALIVE</span>
              <span className="text-green">
                {alive.length}/{survivors.length}
              </span>
            </div>
            <Bar value={percent(alive.length, survivors.length)} tone="green" />
          </div>
          <button
            aria-label="Pause menu"
            title="Pause (Esc)"
            // The ::after box widens the tap target to about 44px without changing how the cog looks
            className="relative size-26 shrink-0 cursor-pointer text-muted transition-colors after:absolute after:-inset-10 hover:text-fg compact:size-20 compact:after:-inset-12"
            onClick={() => setPaused(true)}
          >
            <CogIcon />
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 items-start gap-24 px-36 pt-24 compact:flex-col compact:items-stretch compact:gap-10 compact:px-12 compact:pt-10">
        <section
          data-tour="supplies"
          className="flex w-360 shrink-0 flex-col gap-11 rounded border border-line bg-panel px-23 py-20 compact:w-auto compact:gap-8 compact:px-12 compact:py-10">
          <h2 className={HEADING}>Supplies</h2>
          <div className="flex flex-col gap-11 compact:grid compact:grid-cols-4 compact:gap-8 narrow:grid-cols-2">
            {SUPPLY_IDS.map((id) => {
              const supply = describeSupply(id, supplies[id], alive.length);
              return (
                <div
                  key={id}
                  className="flex min-w-0 flex-col gap-8 rounded border border-line bg-panel-2 px-17 py-14 compact:gap-5 compact:px-10 compact:py-8"
                >
                  {/* When compact, several supplies share a row, so the name stacks above its amount */}
                  <div className={`${ROW} compact:flex-col compact:items-start compact:gap-1`}>
                    <span className="text-[length:calc(23*var(--u))] tracking-[0.04em] whitespace-nowrap compact:text-[length:calc(15*var(--u))]">
                      {supply.name}
                    </span>
                    <span
                      className={`font-label text-[length:calc(16*var(--u))] whitespace-nowrap compact:text-[length:calc(12*var(--u))] ${TEXT_TONE[supply.color]}`}
                    >
                      {supply.amountText}
                    </span>
                  </div>
                  <Bar value={supply.fill} tone={supply.color} />
                  <div className="flex items-start justify-between gap-8 text-[length:calc(16*var(--u))] text-muted compact:text-[length:calc(11*var(--u))]">
                    <span className={supply.low ? "text-blood" : ""}>{supply.note}</span>
                    <span className="font-label text-[length:calc(13.5*var(--u))] compact:text-[length:calc(10*var(--u))]">
                      {supply.usageText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section data-tour="survivors" className="flex min-w-0 flex-1 flex-col gap-16 compact:gap-8">
          <div className="flex items-center justify-between gap-12">
            <h2 className={HEADING}>Survivors</h2>
            {needAttention > 0 && (
              <span className="font-label text-[length:calc(14*var(--u))] text-blood compact:text-[length:calc(11*var(--u))]">
                {needAttention} need attention
              </span>
            )}
          </div>

          {/* Cards on wide screens; when compact each survivor becomes a one-line row */}
          <div className="grid grid-cols-5 gap-16 compact:grid-cols-2 compact:gap-x-8 compact:gap-y-5 narrow:grid-cols-1">
            {survivors.map((survivor) => {
              const dead = !isAlive(survivor);
              const tone = STATUS_COLOR[survivor.status];
              const healthTone: ColorStatus = survivor.health < LOW_HEALTH ? "red" : "green";
              return (
                <article
                  key={survivor.id}
                  className={`flex min-w-0 flex-col gap-13 rounded border bg-panel p-16 compact:grid compact:grid-cols-[auto_minmax(0,1fr)_auto_calc(80*var(--u))] compact:items-center compact:gap-x-8 compact:px-8 compact:py-3 ${
                    // Dead survivors keep their card but fade to gray, whatever their last status
                    dead ? "border-line opacity-45 grayscale" : CARD_TONE[tone]
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-x-10 gap-y-8 compact:contents">
                    <div
                      className={`flex size-49 shrink-0 items-center justify-center rounded-full border bg-panel-2 font-display text-[length:calc(21.5*var(--u))] compact:col-start-1 compact:row-start-1 compact:size-22 compact:text-[length:calc(10*var(--u))] ${BORDER_TONE[tone]}`}
                    >
                      {initials(survivor.name)}
                    </div>
                    <span
                      className={`rounded-[3px] border px-[0.7em] py-[0.27em] font-label text-[length:calc(10.7*var(--u))] tracking-[0.08em] whitespace-nowrap compact:col-start-3 compact:row-start-1 compact:text-[length:calc(9.5*var(--u))] ${CHIP_TONE[tone]}`}
                    >
                      {dead ? "DEAD" : survivor.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-2 compact:col-start-2 compact:row-start-1 compact:flex-row compact:items-baseline compact:gap-6">
                    <span className="truncate text-[length:calc(21*var(--u))] compact:shrink-0 compact:text-[length:calc(13*var(--u))]">
                      {survivor.name}
                    </span>
                    <span className="truncate text-[length:calc(16*var(--u))] text-muted compact:text-[length:calc(11*var(--u))]">
                      {survivor.role}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 compact:col-start-4 compact:row-start-1 compact:gap-2">
                    <div
                      className={`${ROW} font-label text-[length:calc(12*var(--u))] compact:text-[length:calc(9*var(--u))]`}
                    >
                      <span className="tracking-[0.1em] text-muted">HEALTH</span>
                      <span className={TEXT_TONE[healthTone]}>{survivor.health}</span>
                    </div>
                    <Bar value={survivor.health} tone={healthTone} thin />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="flex shrink-0 justify-end px-56 pt-36 pb-40 compact:px-12 compact:pt-10 compact:pb-[calc(10*var(--u)_+_env(safe-area-inset-bottom))]">
        <Button
          variant="primary"
          className="block min-h-0 min-w-[10em] px-[1.1em] py-[0.64em] text-[length:calc(23*var(--u))] compact:text-[length:calc(18*var(--u))] narrow:w-full"
          onClick={onBeginDay}
          data-tour="begin-day"
        >
          Begin Day&nbsp;&nbsp;→
        </Button>
      </footer>

      <Onboarding survivors={survivors} onBeginDay={onBeginDay} replay={tutorialRuns} />
      {children}
      {paused && (
        <PauseMenu
          onResume={() => setPaused(false)}
          onHowToPlay={() => {
            setPaused(false);
            setTutorialRuns((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}
