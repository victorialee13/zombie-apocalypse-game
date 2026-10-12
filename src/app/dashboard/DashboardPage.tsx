"use client";

import { useEffect } from "react";
import "./DashboardPage.css";
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
    <div className={`bar ${thin ? "bar-thin" : ""}`}>
      <div className={`bar-fill tone-${tone}`} style={{ width: `${value}%` }} />
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

type DashboardPageProps = {
  day: number;
  supplies: Supplies;
  survivors: Survivor[];
  onBeginDay?: () => void;
};

export default function DashboardPage({ day, supplies, survivors, onBeginDay }: DashboardPageProps) {
  useDisableZoom();

  const alive = survivors.filter(isAlive);
  const needAttention = alive.filter((s) => s.status !== "Healthy").length;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="day">
          <span>DAY {String(day).padStart(2, "0")}</span>
          <span className="day-total">/ {TOTAL_DAYS}</span>
        </div>

        <div className="meter">
          <div className="meter-row">
            <span className="meter-label">SURVIVORS ALIVE</span>
            <span className="text-green">
              {alive.length}/{survivors.length}
            </span>
          </div>
          <Bar value={percent(alive.length, survivors.length)} tone="green" />
        </div>
      </header>

      <main className="dashboard-body">
        <section className="supplies">
          <h2>Supplies</h2>
          <div className="supply-list">
            {SUPPLY_IDS.map((id) => {
              const supply = describeSupply(id, supplies[id], alive.length);
              return (
                <div key={id} className="supply">
                  <div className="supply-row">
                    <span className="supply-name">{supply.name}</span>
                    <span className={`supply-amount text-${supply.color}`}>{supply.amountText}</span>
                  </div>
                  <Bar value={supply.fill} tone={supply.color} />
                  <div className="supply-row supply-meta">
                    <span className={supply.low ? "text-red" : ""}>{supply.note}</span>
                    <span className="supply-usage">{supply.usageText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="survivors">
          <div className="survivors-header">
            <h2>Survivors</h2>
            {needAttention > 0 && (
              <span className="attention">{needAttention} need attention</span>
            )}
          </div>

          <div className="survivor-grid">
            {survivors.map((survivor) => {
              const tone = STATUS_COLOR[survivor.status];
              const healthTone: ColorStatus = survivor.health < LOW_HEALTH ? "red" : "green";
              return (
                <article key={survivor.id} className={`survivor-card card-${tone}`}>
                  <div className="survivor-top">
                    <div className={`avatar border-${tone}`}>{initials(survivor.name)}</div>
                    <span className={`chip chip-${tone}`}>{survivor.status.toUpperCase()}</span>
                  </div>
                  <div className="survivor-info">
                    <span className="survivor-name">{survivor.name}</span>
                    <span className="survivor-role">{survivor.role}</span>
                  </div>
                  <div className="health">
                    <div className="health-row">
                      <span className="health-label">HEALTH</span>
                      <span className={`text-${healthTone}`}>{survivor.health}</span>
                    </div>
                    <Bar value={survivor.health} tone={healthTone} thin />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <button className="btn btn-primary" onClick={onBeginDay}>
          Begin Day&nbsp;&nbsp;→
        </button>
      </footer>
    </div>
  );
}
