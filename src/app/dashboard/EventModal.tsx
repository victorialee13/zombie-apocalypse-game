"use client";

import { useState } from "react";
import Button from "../../components/Button";
import type { ColorStatus } from "../../game/colors";
import type { Choice, DayEvent } from "../../game/events";
import { loadSettings } from "../../game/settings";
import { SUPPLY_IDS, SUPPLY_INFO } from "../../game/supplies";
import { STATUS_COLOR, firstNameByRole, type Survivor } from "../../game/survivors";
import Modal, { BODY, BUTTON, NOTE_TEXT } from "./Modal";
import { CHIP_TONE } from "./tones";

const LETTERS = ["A", "B", "C", "D"];

type Effect = { tone: ColorStatus; text: string };

// Spells out everything a choice changes, so the cost is visible before committing
function describeEffects(choice: Choice, survivors: Survivor[]): Effect[] {
  const effects: Effect[] = [];

  for (const id of SUPPLY_IDS) {
    const change = choice.supplies?.[id];
    if (!change) continue;
    effects.push({
      tone: change > 0 ? "green" : "red",
      text: `${change > 0 ? "+" : "−"}${Math.abs(change)} ${SUPPLY_INFO[id].unit}`,
    });
  }

  for (const effect of choice.survivors ?? []) {
    const parts: string[] = [];
    if (effect.health) parts.push(`${effect.health > 0 ? "+" : "−"}${Math.abs(effect.health)} health`);
    if (effect.status) parts.push(effect.status);
    const hurt = (effect.health ?? 0) < 0;
    effects.push({
      tone: hurt ? "red" : effect.status ? STATUS_COLOR[effect.status] : "green",
      text: `${firstNameByRole(survivors, effect.role)} ${parts.join(" · ")}`,
    });
  }

  return effects;
}

function Chips({ effects }: { effects: Effect[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {effects.map((effect) => (
        <span
          key={effect.text}
          className={`rounded-[3px] border px-[0.7em] py-[0.3em] font-label text-[length:calc(11.5*var(--t))] tracking-[0.04em] ${CHIP_TONE[effect.tone]}`}
        >
          {effect.text}
        </span>
      ))}
    </div>
  );
}

type EventModalProps = {
  day: number;
  event: DayEvent;
  survivors: Survivor[];
  onChoose: (choice: Choice) => void;
  onNightFalls: () => void;
};

export default function EventModal({ day, event, survivors, onChoose, onNightFalls }: EventModalProps) {
  const [confirmFirst] = useState(() => loadSettings().confirmDecisions === "On");
  const [selected, setSelected] = useState<number | null>(null);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const dayLabel = `DAY ${String(day).padStart(2, "0")}`;

  function commit(choice: Choice) {
    setChosen(choice);
    onChoose(choice);
  }

  if (chosen) {
    return (
      <Modal width={640} label={`${dayLabel} · OUTCOME`} title={chosen.title}>
        <p className={BODY}>{chosen.outcome}</p>
        <Chips effects={describeEffects(chosen, survivors)} />
        <div className="flex justify-end border-t border-line pt-18">
          <Button variant="primary" className={BUTTON} onClick={onNightFalls}>
            Night falls&nbsp;&nbsp;→
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal width={960} label={`${dayLabel} · EVENT`} title={event.title}>
      <p className={`${BODY} max-w-[60em]`}>{event.story}</p>

      <div className="grid grid-cols-3 gap-12 narrow:grid-cols-1">
        {event.choices.map((choice, i) => (
          <button
            key={choice.title}
            aria-pressed={selected === i}
            className={`flex cursor-pointer flex-col gap-10 rounded border bg-panel-2 p-16 text-left transition-colors ${
              selected === i ? "border-blood bg-blood/10" : "border-line hover:border-muted"
            }`}
            onClick={() => (confirmFirst ? setSelected(i) : commit(choice))}
          >
            <div className="flex items-center gap-10">
              <span
                className={`flex size-26 shrink-0 items-center justify-center rounded-full border font-label text-[length:calc(13*var(--t))] ${
                  selected === i ? "border-blood bg-blood" : "border-muted text-muted"
                }`}
              >
                {LETTERS[i]}
              </span>
              <span className="text-[length:calc(19*var(--t))]">{choice.title}</span>
            </div>
            <p className={NOTE_TEXT}>{choice.description}</p>
            <div className="mt-auto pt-4">
              <Chips effects={describeEffects(choice, survivors)} />
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-16 border-t border-line pt-18">
        <span className="text-[length:calc(14*var(--t))] text-amber">Choices can’t be undone.</span>
        {confirmFirst && (
          <Button
            variant="primary"
            className={`${BUTTON} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100`}
            disabled={selected === null}
            onClick={() => selected !== null && commit(event.choices[selected])}
          >
            Confirm choice&nbsp;&nbsp;→
          </Button>
        )}
      </div>
    </Modal>
  );
}
