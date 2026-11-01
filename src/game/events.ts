import type { ColorStatus } from "./colors";
import { RANDOM_EVENTS } from "./eventPool";
import { applySupplyChange, type Supplies } from "./supplies";
import {
  EVERYONE,
  LOW_HEALTH,
  clampHealth,
  firstNameByRole,
  isAlive,
  type Status,
  type Survivor,
} from "./survivors";

// Survivors are picked by role rather than name, so events keep working if the roster changes
export type SurvivorEffect = { role: string; health?: number; status?: Status };

export type Effects = {
  supplies?: Partial<Supplies>;
  survivors?: SurvivorEffect[];
};

export type OutcomeKind = "success" | "mixed" | "failure";

export const OUTCOME_KIND: Record<OutcomeKind, { label: string; tone: ColorStatus }> = {
  success: { label: "Success", tone: "green" },
  mixed: { label: "Mixed", tone: "amber" },
  failure: { label: "Disaster", tone: "red" },
};

// One possible result of a choice. A choice's chances add up to 100
export type Outcome = Effects & {
  kind: OutcomeKind;
  chance: number;
  text: string;
};

export type Choice = {
  title: string;
  description: string;
  lead?: string; // role of whoever goes; their condition shifts the odds, and the choice is gone if they're dead
  cost?: Partial<Supplies>; // paid whatever happens
  outcomes: Outcome[];
};

export type DayEvent = {
  title: string;
  story: string;
  choices: Choice[];
};

export type NameOf = (role: string) => string;

const DAY_EVENTS: Record<number, (name: NameOf) => DayEvent> = {
  1: (name) => ({
    title: "The Voice Under Station 4",
    story:
      "The radio wakes everyone before dawn. It’s the same voice from last night, weaker now: a woman trapped in the tunnels under Station 4, six blocks east. She says the station clinic was never looted. Then the signal cuts out.",
    choices: [
      {
        title: "Send a rescue team",
        description: `${name("Scout")} and ${name("Ex-Soldier")} go in armed. It’ll be loud, but they can carry back whatever is there.`,
        lead: "Ex-Soldier",
        cost: { ammo: -12 },
        outcomes: [
          {
            kind: "success",
            chance: 30,
            text: `They fought through without a scratch. She was gone, but the clinic was untouched, and they came back carrying everything they could hold.`,
            supplies: { medicine: 8, food: 15, water: 12 },
          },
          {
            kind: "mixed",
            chance: 50,
            text: `They reached the tunnels too late. She was gone. But the clinic was real, and they came back loaded. ${name("Ex-Soldier")} took a bad gash holding the stairwell while ${name("Scout")} cleared the shelves.`,
            supplies: { medicine: 6, food: 9 },
            survivors: [{ role: "Ex-Soldier", health: -20, status: "Injured" }],
          },
          {
            kind: "failure",
            chance: 20,
            text: `The tunnels were full of them. ${name("Ex-Soldier")} held the stairwell long enough for ${name("Scout")} to grab one kit, and both came back bleeding.`,
            supplies: { medicine: 1 },
            survivors: [
              { role: "Ex-Soldier", health: -30, status: "Injured" },
              { role: "Scout", health: -15 },
            ],
          },
        ],
      },
      {
        title: "Send the scout alone",
        description: `${name("Scout")} slips out quietly. No shots fired, but no one watching their back.`,
        lead: "Scout",
        outcomes: [
          {
            kind: "success",
            chance: 35,
            text: `${name("Scout")} was in and out before the sun was up, unseen, with a bag full of kits and canned food from the clinic’s break room.`,
            supplies: { medicine: 5, food: 9 },
          },
          {
            kind: "mixed",
            chance: 45,
            text: `${name("Scout")} came back at dusk, limping, with two kits stuffed in a jacket. No sign of the woman. Nobody asks what happened on the way back.`,
            supplies: { medicine: 2 },
            survivors: [{ role: "Scout", health: -25, status: "Injured" }],
          },
          {
            kind: "failure",
            chance: 20,
            text: `${name("Scout")} never reached the clinic. They made it home after dark, empty-handed and badly hurt.`,
            survivors: [{ role: "Scout", health: -40, status: "Injured" }],
          },
        ],
      },
      {
        title: "Stay sealed in",
        description: "Nobody leaves. You switch the radio off and tell everyone to get some rest.",
        outcomes: [
          {
            kind: "success",
            chance: 30,
            text: `The rest did everyone good. ${name("Farmer")} finally slept, and ${name("Cook")} found a forgotten crate of water in the basement.`,
            supplies: { water: 9 },
            survivors: [
              { role: "Medic", health: -10 },
              { role: "Farmer", status: "Healthy" },
            ],
          },
          {
            kind: "mixed",
            chance: 70,
            text: `Someone turned the radio back on. The voice kept calling until noon, then stopped. ${name("Medic")}’s fever climbed with no medicine coming, and the shelter has been quiet since.`,
            survivors: [
              { role: "Medic", health: -10 },
              { role: "Teacher", status: "Scared" },
              { role: "Cook", status: "Scared" },
            ],
          },
        ],
      },
    ],
  }),
};

function namer(survivors: Survivor[]): NameOf {
  return (role) => firstNameByRole(survivors, role);
}

// Days with a written event use it; every other day draws an event this run hasn't seen yet
export function eventForDay(day: number, survivors: Survivor[], seen: string[]): DayEvent | null {
  const name = namer(survivors);
  const written = DAY_EVENTS[day];
  if (written) return written(name);

  const fresh = RANDOM_EVENTS.map((build) => build(name)).filter(
    (event) => !seen.includes(event.title) && event.choices.some((choice) => isAvailable(choice, survivors)),
  );
  return fresh.length > 0 ? fresh[Math.floor(Math.random() * fresh.length)] : null;
}

export function leadOf(choice: Choice, survivors: Survivor[]) {
  return choice.lead ? survivors.find((s) => s.role === choice.lead) : undefined;
}

export function isAvailable(choice: Choice, survivors: Survivor[]) {
  const lead = leadOf(choice, survivors);
  return !choice.lead || (lead !== undefined && isAlive(lead));
}

const LEAD_BONUS = 10;

/*
 * A healthy lead turns some disasters into successes; a hurt or sick one does the opposite.
 * Returns the adjusted outcomes plus a line explaining why the odds moved.
 */
export function oddsFor(choice: Choice, survivors: Survivor[]) {
  const lead = leadOf(choice, survivors);
  let shift = 0;
  let note = "";
  if (lead && isAlive(lead)) {
    const first = lead.name.split(" ")[0];
    if (lead.status === "Healthy" && lead.health >= 60) {
      shift = LEAD_BONUS;
      note = `${first} is in good shape: +${LEAD_BONUS}% success`;
    } else if (lead.health < LOW_HEALTH || lead.status === "Sick" || lead.status === "Injured") {
      shift = -LEAD_BONUS;
      note = `${first} is ${lead.health < LOW_HEALTH ? "badly hurt" : lead.status.toLowerCase()}: −${LEAD_BONUS}% success`;
    }
  }

  const success = choice.outcomes.find((o) => o.kind === "success");
  const failure = choice.outcomes.find((o) => o.kind === "failure");
  if (!success || !failure) return { outcomes: choice.outcomes, note: "" };

  const moved = shift > 0 ? Math.min(shift, failure.chance) : -Math.min(-shift, success.chance);
  const outcomes = choice.outcomes.map((o) =>
    o === success ? { ...o, chance: o.chance + moved } : o === failure ? { ...o, chance: o.chance - moved } : o,
  );
  return { outcomes, note: moved === 0 ? "" : note };
}

export function rollOutcome(outcomes: Outcome[]): Outcome {
  let roll = Math.random() * 100;
  for (const outcome of outcomes) {
    roll -= outcome.chance;
    if (roll < 0) return outcome;
  }
  return outcomes[outcomes.length - 1];
}

// The choice's upfront cost and the rolled outcome, combined into one set of changes
export function totalEffects(choice: Choice, outcome: Outcome): Effects {
  const supplies: Partial<Supplies> = { ...choice.cost };
  for (const [id, amount] of Object.entries(outcome.supplies ?? {}) as [keyof Supplies, number][]) {
    supplies[id] = (supplies[id] ?? 0) + amount;
  }
  return { supplies, survivors: outcome.survivors };
}

export function applyEffects(effects: Effects, supplies: Supplies, survivors: Survivor[]) {
  return {
    supplies: applySupplyChange(supplies, effects.supplies ?? {}),
    survivors: survivors.map((survivor) => {
      if (!isAlive(survivor)) return survivor;
      let next = survivor;
      for (const effect of effects.survivors ?? []) {
        if (effect.role !== survivor.role && effect.role !== EVERYONE) continue;
        next = {
          ...next,
          health: clampHealth(next.health + (effect.health ?? 0)),
          status: effect.status ?? next.status,
        };
      }
      return next;
    }),
  };
}
