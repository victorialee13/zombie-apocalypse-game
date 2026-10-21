import { applySupplyChange, type Supplies } from "./supplies";
import { clampHealth, firstNameByRole, isAlive, type Status, type Survivor } from "./survivors";

// Survivors are picked by role rather than name, so events keep working if the roster changes
export type SurvivorEffect = { role: string; health?: number; status?: Status };

export type Choice = {
  title: string;
  description: string;
  supplies?: Partial<Supplies>;
  survivors?: SurvivorEffect[];
  outcome: string;
};

export type DayEvent = {
  title: string;
  story: string;
  choices: Choice[];
};

type NameOf = (role: string) => string;

const DAY_EVENTS: Record<number, (name: NameOf) => DayEvent> = {
  1: (name) => ({
    title: "The Voice Under Station 4",
    story:
      "The radio wakes everyone before dawn. It’s the same voice from last night, weaker now: a woman trapped in the tunnels under Station 4, six blocks east. She says the station clinic was never looted. Then the signal cuts out.",
    choices: [
      {
        title: "Send a rescue team",
        description: `${name("Scout")} and ${name("Ex-Soldier")} go in armed. It’ll be loud, but they can carry back whatever is there.`,
        supplies: { ammo: -12, medicine: 4, food: 6 },
        survivors: [{ role: "Ex-Soldier", health: -20, status: "Injured" }],
        outcome: `They reached the tunnels too late. She was gone. But the clinic was real, and they came back loaded. ${name("Ex-Soldier")} took a bad gash holding the stairwell while ${name("Scout")} cleared the shelves.`,
      },
      {
        title: "Send the scout alone",
        description: `${name("Scout")} slips out quietly. No shots fired, but no one watching their back.`,
        supplies: { medicine: 2 },
        survivors: [{ role: "Scout", health: -25, status: "Injured" }],
        outcome: `${name("Scout")} came back at dusk, limping, with two kits stuffed in a jacket. No sign of the woman. Nobody asks what happened on the way back.`,
      },
      {
        title: "Stay sealed in",
        description: "Nobody leaves. You switch the radio off and tell everyone to get some rest.",
        survivors: [
          { role: "Medic", health: -10 },
          { role: "Teacher", status: "Scared" },
          { role: "Cook", status: "Scared" },
        ],
        outcome: `Someone turned the radio back on. The voice kept calling until noon, then stopped. ${name("Medic")}’s fever climbed with no medicine coming, and the shelter has been quiet since.`,
      },
    ],
  }),
};

export function eventForDay(day: number, survivors: Survivor[]): DayEvent | null {
  const build = DAY_EVENTS[day];
  return build ? build((role) => firstNameByRole(survivors, role)) : null;
}

export function applyChoice(choice: Choice, supplies: Supplies, survivors: Survivor[]) {
  return {
    supplies: applySupplyChange(supplies, choice.supplies ?? {}),
    survivors: survivors.map((survivor) => {
      const effect = choice.survivors?.find((e) => e.role === survivor.role);
      if (!effect || !isAlive(survivor)) return survivor;
      return {
        ...survivor,
        health: clampHealth(survivor.health + (effect.health ?? 0)),
        status: effect.status ?? survivor.status,
      };
    }),
  };
}
