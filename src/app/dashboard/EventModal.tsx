"use client";

import { useState } from "react";
import Button from "../../components/Button";
import type { ColorStatus } from "../../game/colors";
import {
  OUTCOME_KIND,
  isAvailable,
  leadOf,
  oddsFor,
  totalEffects,
  type Choice,
  type DayEvent,
  type Effects,
  type Outcome,
} from "../../game/events";
import { loadSettings } from "../../game/settings";
import { SUPPLY_IDS, SUPPLY_INFO } from "../../game/supplies";
import { EVERYONE, STATUS_COLOR, firstNameByRole, type Survivor } from "../../game/survivors";
import Modal, { BODY, BUTTON, NOTE_TEXT } from "./Modal";
import { CHIP_TONE, FILL_TONE, TEXT_TONE } from "./tones";

const LETTERS = ["A", "B", "C", "D"];
const SMALL_LABEL = "font-label text-[length:calc(11*var(--t))] tracking-[0.1em] text-muted";

type Effect = { tone: ColorStatus; text: string };

// Spells out everything a set of effects changes, so costs and rewards are visible before committing
function describeEffects(effects: Effects, survivors: Survivor[]): Effect[] {
  const list: Effect[] = [];

  for (const id of SUPPLY_IDS) {
    const change = effects.supplies?.[id];
    if (!change) continue;
    list.push({
      tone: change > 0 ? "green" : "red",
      text: `${change > 0 ? "+" : "−"}${Math.abs(change)} ${SUPPLY_INFO[id].unit}`,
    });
  }

  for (const effect of effects.survivors ?? []) {
    const parts: string[] = [];
    if (effect.health) parts.push(`${effect.health > 0 ? "+" : "−"}${Math.abs(effect.health)} health`);
    if (effect.status) parts.push(effect.status);
    const who = effect.role === EVERYONE ? "Everyone" : firstNameByRole(survivors, effect.role);
    const hurt = (effect.health ?? 0) < 0;
    list.push({
      tone: hurt ? "red" : effect.status ? STATUS_COLOR[effect.status] : "green",
      text: `${who} ${parts.join(" · ")}`,
    });
  }

  return list;
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

// A bar split into the chance of each outcome, with the percentages underneath
function Odds({ outcomes }: { outcomes: Outcome[] }) {
  if (outcomes.length === 1) {
    return <span className={`${NOTE_TEXT} text-[length:calc(12*var(--t))]`}>Certain outcome</span>;
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex h-6 w-full gap-2 overflow-hidden rounded-full">
        {outcomes.map((o) => (
          <div key={o.kind} className={FILL_TONE[OUTCOME_KIND[o.kind].tone]} style={{ width: `${o.chance}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-10 font-label text-[length:calc(11.5*var(--t))]">
        {outcomes.map((o) => (
          <span key={o.kind} className={TEXT_TONE[OUTCOME_KIND[o.kind].tone]}>
            {o.chance}% {OUTCOME_KIND[o.kind].label.toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

export type EventResult = { choice: Choice; outcome: Outcome };

type EventModalProps = {
  day: number;
  event: DayEvent;
  survivors: Survivor[];
  result: EventResult | null;
  continueLabel: string;
  onChoose: (choice: Choice) => void;
  onContinue: () => void;
};

export default function EventModal({
  day,
  event,
  survivors,
  result,
  continueLabel,
  onChoose,
  onContinue,
}: EventModalProps) {
  const [confirmFirst] = useState(() => loadSettings().confirmDecisions === "On");
  const [selected, setSelected] = useState<number | null>(null);
  const dayLabel = `DAY ${String(day).padStart(2, "0")}`;

  if (result) {
    const kind = OUTCOME_KIND[result.outcome.kind];
    return (
      <Modal minimizable width={640} label={`${dayLabel} · OUTCOME`} title={result.choice.title}>
        <span
          className={`self-start rounded-[3px] border px-[0.8em] py-[0.3em] font-label text-[length:calc(13*var(--t))] tracking-[0.14em] ${CHIP_TONE[kind.tone]}`}
        >
          {kind.label.toUpperCase()}
        </span>
        <p className={BODY}>{result.outcome.text}</p>
        <Chips effects={describeEffects(totalEffects(result.choice, result.outcome), survivors)} />
        <div className="flex justify-end border-t border-line pt-18">
          <Button variant="primary" className={BUTTON} autoFocus onClick={onContinue}>
            {continueLabel}&nbsp;&nbsp;→
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal minimizable width={1000} label={`${dayLabel} · EVENT`} title={event.title}>
      <p className={`${BODY} max-w-[60em]`}>{event.story}</p>

      <div className="grid auto-cols-fr grid-flow-col gap-12 narrow:grid-flow-row">
        {event.choices.map((choice, i) => {
          const available = isAvailable(choice, survivors);
          const { outcomes, note } = oddsFor(choice, survivors);
          const best = outcomes.find((o) => o.kind === "success") ?? outcomes[0];
          const cost = describeEffects({ supplies: choice.cost }, survivors);
          return (
            <button
              key={choice.title}
              aria-pressed={selected === i}
              disabled={!available}
              className={`flex flex-col gap-10 rounded border bg-panel-2 p-16 text-left transition-colors ${
                !available
                  ? "cursor-not-allowed border-line opacity-45 grayscale"
                  : selected === i
                    ? "cursor-pointer border-blood bg-blood/10"
                    : "cursor-pointer border-line hover:border-muted"
              }`}
              onClick={() => (confirmFirst ? setSelected(i) : onChoose(choice))}
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

              {available ? (
                <div className="mt-auto flex flex-col gap-10 pt-4">
                  {cost.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <span className={SMALL_LABEL}>COSTS</span>
                      <Chips effects={cost} />
                    </div>
                  )}
                  {best.kind === "success" && (
                    <div className="flex flex-col gap-4">
                      <span className={SMALL_LABEL}>IF IT GOES WELL</span>
                      <Chips effects={describeEffects(best, survivors)} />
                    </div>
                  )}
                  <Odds outcomes={outcomes} />
                  {note && <span className={`${NOTE_TEXT} text-[length:calc(12*var(--t))]`}>{note}</span>}
                </div>
              ) : (
                <span className="mt-auto pt-4 text-[length:calc(13*var(--t))] text-blood">
                  {leadOf(choice, survivors)?.name.split(" ")[0] ?? `The ${choice.lead?.toLowerCase()}`} is dead.
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-16 border-t border-line pt-18">
        <span className="text-[length:calc(14*var(--t))] text-amber">Choices can’t be undone. Luck decides the rest.</span>
        {confirmFirst && (
          <Button
            variant="primary"
            className={`${BUTTON} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100`}
            disabled={selected === null}
            onClick={() => selected !== null && onChoose(event.choices[selected])}
          >
            Confirm choice&nbsp;&nbsp;→
          </Button>
        )}
      </div>
    </Modal>
  );
}
