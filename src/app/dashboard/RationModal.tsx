"use client";

import { useState } from "react";
import Button from "../../components/Button";
import {
  GO_WITHOUT_DAMAGE,
  RATIONED,
  isShort,
  rationNeeds,
  rosterOrderPlan,
  type RationPlan,
  type Rationed,
} from "../../game/night";
import { SUPPLY_INFO, type Supplies } from "../../game/supplies";
import { LOW_HEALTH, STATUS_COLOR, type Survivor } from "../../game/survivors";
import Modal, { BODY, BUTTON, NOTE_TEXT } from "./Modal";
import { CHIP_TONE, TEXT_TONE } from "./tones";

const SECTION_TITLE: Record<Rationed, string> = {
  food: "Who eats tonight?",
  water: "Who drinks tonight?",
  medicine: "Who gets a medicine kit?",
};

type RationModalProps = {
  day: number;
  supplies: Supplies;
  survivors: Survivor[];
  onConfirm: (plan: RationPlan) => void;
};

// Shown before the night when stores can't cover everyone: the player picks who goes without
export default function RationModal({ day, supplies, survivors, onConfirm }: RationModalProps) {
  const needs = rationNeeds(supplies, survivors);
  const short = RATIONED.filter((id) => isShort(needs[id]));
  // Starts from the old roster-order split so there's always a valid plan to confirm
  const [plan, setPlan] = useState(() => rosterOrderPlan(supplies, survivors));
  const ready = short.every((id) => plan[id].length === needs[id].slots);

  function toggle(id: Rationed, survivorId: string) {
    const given = plan[id];
    if (given.includes(survivorId)) {
      setPlan({ ...plan, [id]: given.filter((s) => s !== survivorId) });
    } else if (given.length < needs[id].slots) {
      setPlan({ ...plan, [id]: [...given, survivorId] });
    }
  }

  return (
    <Modal minimizable width={1000} label={`DAY ${String(day).padStart(2, "0")} · RATIONS`} title="Not enough to go around">
      <p className={BODY}>Night is coming and the stores won’t cover everyone. You decide who goes without.</p>

      {short.map((id) => {
        const { candidates, slots } = needs[id];
        const given = plan[id];
        const full = given.length === slots;
        const damage = GO_WITHOUT_DAMAGE[id];
        return (
          <section key={id} className="flex flex-col gap-10 border-t border-line pt-14">
            <div className="flex flex-wrap items-baseline justify-between gap-x-16 gap-y-4">
              <h3 className="text-[length:calc(20*var(--t))]">{SECTION_TITLE[id]}</h3>
              <span className={`font-label text-[length:calc(13*var(--t))] ${full ? "text-green" : "text-amber"}`}>
                {given.length}/{slots} {SUPPLY_INFO[id].unit} given · {candidates.length - slots} go without (−{damage}{" "}
                health)
              </span>
            </div>

            <div className="grid grid-cols-5 gap-8 compact:grid-cols-3 narrow:grid-cols-2">
              {candidates.map((s) => {
                const gets = given.includes(s.id);
                const locked = !gets && full;
                const atRisk = s.health <= damage;
                return (
                  <button
                    key={s.id}
                    aria-pressed={gets}
                    disabled={locked}
                    title={
                      locked ? `All the ${SUPPLY_INFO[id].name.toLowerCase()} is handed out. Take some back first.` : undefined
                    }
                    className={`flex min-w-0 flex-col gap-4 rounded border px-10 py-8 text-left transition-colors ${
                      gets
                        ? "cursor-pointer border-green bg-green/10"
                        : locked
                          ? "cursor-not-allowed border-line bg-panel-2 opacity-60"
                          : "cursor-pointer border-line bg-panel-2 hover:border-muted"
                    }`}
                    onClick={() => toggle(id, s.id)}
                  >
                    <span className="truncate text-[length:calc(16*var(--t))]">{s.name.split(" ")[0]}</span>
                    <span className={`truncate ${NOTE_TEXT} text-[length:calc(12*var(--t))]`}>{s.role}</span>
                    <div className="flex flex-wrap items-center gap-6">
                      <span
                        className={`font-label text-[length:calc(12*var(--t))] ${TEXT_TONE[s.health < LOW_HEALTH ? "red" : "green"]}`}
                      >
                        {s.health} HP
                      </span>
                      {s.status !== "Healthy" && (
                        <span
                          className={`rounded-[3px] border px-[0.5em] font-label text-[length:calc(10*var(--t))] tracking-[0.06em] ${CHIP_TONE[STATUS_COLOR[s.status]]}`}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-label text-[length:calc(11*var(--t))] ${
                        gets ? "text-green" : atRisk ? "text-blood" : "text-muted"
                      }`}
                    >
                      {gets ? `✓ Gets ${SUPPLY_INFO[id].name.toLowerCase()}` : atRisk ? "Could die" : `−${damage} health`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="flex items-center justify-between gap-16 border-t border-line pt-18">
        <span className="text-[length:calc(14*var(--t))] text-amber">
          {ready ? "Everything is handed out." : "Hand out everything you have before night falls."}
        </span>
        <Button
          variant="primary"
          className={`${BUTTON} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100`}
          disabled={!ready}
          onClick={() => onConfirm(plan)}
        >
          Night falls&nbsp;&nbsp;→
        </Button>
      </div>
    </Modal>
  );
}
