"use client";

import { useState } from "react";
import {
  applyEffects,
  eventForDay,
  oddsFor,
  rollOutcome,
  totalEffects,
  type Choice,
  type DayEvent,
  type OutcomeKind,
} from "../../game/events";
import { resolveNight, type ReportLine } from "../../game/night";
import { TOTAL_DAYS } from "../../game/rules";
import { STARTING_SUPPLIES, type Supplies } from "../../game/supplies";
import { STARTING_SURVIVORS, isAlive, type Survivor } from "../../game/survivors";
import DashboardPage from "./DashboardPage";
import EndScreen from "./EndScreen";
import EventModal, { type EventResult } from "./EventModal";
import NightModal from "./NightModal";

// Each day goes dashboard → event (pick a choice, luck decides how it goes) → night report → the next day,
// until everyone is dead or the last night is over
type Phase =
  | { kind: "dashboard" }
  | { kind: "event"; event: DayEvent; result: EventResult | null }
  | { kind: "night"; before: Supplies; report: ReportLine[] }
  | { kind: "end"; won: boolean };

const anyoneAlive = (survivors: Survivor[]) => survivors.some(isAlive);

export default function Dashboard() {
  const [day, setDay] = useState(1);
  const [supplies, setSupplies] = useState(STARTING_SUPPLIES);
  const [survivors, setSurvivors] = useState(STARTING_SURVIVORS);
  const [phase, setPhase] = useState<Phase>({ kind: "dashboard" });
  const [seenEvents, setSeenEvents] = useState<string[]>([]);
  const [results, setResults] = useState<OutcomeKind[]>([]);

  function beginDay() {
    if (phase.kind !== "dashboard") return;
    const event = eventForDay(day, survivors, seenEvents);
    // Days without an event go straight to the night
    if (!event) return nightFalls();
    setSeenEvents([...seenEvents, event.title]);
    setPhase({ kind: "event", event, result: null });
  }

  function choose(event: DayEvent, choice: Choice) {
    const outcome = rollOutcome(oddsFor(choice, survivors).outcomes);
    const next = applyEffects(totalEffects(choice, outcome), supplies, survivors);
    setSupplies(next.supplies);
    setSurvivors(next.survivors);
    setResults([...results, outcome.kind]);
    setPhase({ kind: "event", event, result: { choice, outcome } });
  }

  function nightFalls() {
    if (!anyoneAlive(survivors)) return setPhase({ kind: "end", won: false });
    const night = resolveNight(supplies, survivors);
    setPhase({ kind: "night", before: supplies, report: night.report });
    setSupplies(night.supplies);
    setSurvivors(night.survivors);
  }

  // The game stops after the last night: either everyone is gone or the shelter made it
  function afterNight() {
    if (!anyoneAlive(survivors)) return setPhase({ kind: "end", won: false });
    if (day >= TOTAL_DAYS) return setPhase({ kind: "end", won: true });
    setDay(day + 1);
    setPhase({ kind: "dashboard" });
  }

  function playAgain() {
    setDay(1);
    setSupplies(STARTING_SUPPLIES);
    setSurvivors(STARTING_SURVIVORS);
    setSeenEvents([]);
    setResults([]);
    setPhase({ kind: "dashboard" });
  }

  const gameOver = !anyoneAlive(survivors) || day >= TOTAL_DAYS;

  return (
    <DashboardPage day={day} supplies={supplies} survivors={survivors} onBeginDay={beginDay}>
      {phase.kind === "event" && (
        <EventModal
          day={day}
          event={phase.event}
          survivors={survivors}
          result={phase.result}
          continueLabel={anyoneAlive(survivors) ? "Night falls" : "See how it ended"}
          onChoose={(choice) => choose(phase.event, choice)}
          onContinue={nightFalls}
        />
      )}
      {phase.kind === "night" && (
        <NightModal
          day={day}
          before={phase.before}
          after={supplies}
          report={phase.report}
          continueLabel={
            !anyoneAlive(survivors)
              ? "See how it ended"
              : gameOver
                ? "Dawn breaks"
                : `On to Day ${String(day + 1).padStart(2, "0")}`
          }
          onContinue={afterNight}
        />
      )}
      {phase.kind === "end" && (
        <EndScreen won={phase.won} day={day} survivors={survivors} results={results} onPlayAgain={playAgain} />
      )}
    </DashboardPage>
  );
}
