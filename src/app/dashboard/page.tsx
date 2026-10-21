"use client";

import { useState } from "react";
import { applyChoice, eventForDay, type Choice, type DayEvent } from "../../game/events";
import { resolveNight, type ReportLine } from "../../game/night";
import { STARTING_SUPPLIES, type Supplies } from "../../game/supplies";
import { STARTING_SURVIVORS } from "../../game/survivors";
import DashboardPage from "./DashboardPage";
import EventModal from "./EventModal";
import NightModal from "./NightModal";

// Each day goes dashboard → event (pick a choice) → night report → the next day's dashboard
type Phase =
  | { kind: "dashboard" }
  | { kind: "event"; event: DayEvent }
  | { kind: "night"; before: Supplies; report: ReportLine[] };

export default function Dashboard() {
  const [day, setDay] = useState(1);
  const [supplies, setSupplies] = useState(STARTING_SUPPLIES);
  const [survivors, setSurvivors] = useState(STARTING_SURVIVORS);
  const [phase, setPhase] = useState<Phase>({ kind: "dashboard" });

  function beginDay() {
    const event = eventForDay(day, survivors);
    // Days without a written event go straight to the night
    if (event) setPhase({ kind: "event", event });
    else nightFalls();
  }

  function choose(choice: Choice) {
    const next = applyChoice(choice, supplies, survivors);
    setSupplies(next.supplies);
    setSurvivors(next.survivors);
  }

  function nightFalls() {
    const night = resolveNight(supplies, survivors);
    setPhase({ kind: "night", before: supplies, report: night.report });
    setSupplies(night.supplies);
    setSurvivors(night.survivors);
  }

  function nextDay() {
    setDay(day + 1);
    setPhase({ kind: "dashboard" });
  }

  return (
    <DashboardPage day={day} supplies={supplies} survivors={survivors} onBeginDay={beginDay}>
      {phase.kind === "event" && (
        <EventModal
          day={day}
          event={phase.event}
          survivors={survivors}
          onChoose={choose}
          onNightFalls={nightFalls}
        />
      )}
      {phase.kind === "night" && (
        <NightModal
          day={day}
          before={phase.before}
          after={supplies}
          report={phase.report}
          onContinue={nextDay}
        />
      )}
    </DashboardPage>
  );
}
