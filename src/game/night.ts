import type { ColorStatus } from "./colors";
import { applySupplyChange, usageAmount, type Supplies } from "./supplies";
import { clampHealth, isAlive, type Survivor } from "./survivors";

export const HUNGER_DAMAGE = 15;
export const THIRST_DAMAGE = 20;
export const UNTREATED_DAMAGE = 10;
export const BREACH_DAMAGE = 15;

export type ReportLine = { tone: ColorStatus; text: string };

export type NightResult = {
  supplies: Supplies;
  survivors: Survivor[];
  report: ReportLine[];
};

/*
 * Everyone eats and drinks, the sick and injured are treated (or get worse when the kits run out),
 * then the horde tests the walls. When stores run short, whoever is last in the roster goes without.
 */
export function resolveNight(supplies: Supplies, survivors: Survivor[]): NightResult {
  const next = survivors.map((s) => ({ ...s }));
  const alive = next.filter(isAlive);
  const report: ReportLine[] = [];
  const hurt = (s: Survivor, amount: number) => {
    s.health = clampHealth(s.health - amount);
  };

  const patients = alive.filter((s) => s.status === "Sick" || s.status === "Injured");
  const treated = patients.slice(0, Math.floor(supplies.medicine / usageAmount("medicine", alive.length)));
  const untreated = patients.slice(treated.length);
  const untreatedStatus = new Map(untreated.map((s) => [s, s.status]));

  const hungry = alive.slice(supplies.food);
  const thirsty = alive.slice(supplies.water);
  const recovered = alive.slice(0, supplies.food).filter((s) => s.status === "Hungry");

  for (const s of treated) s.status = "Healthy";
  for (const s of hungry) {
    hurt(s, HUNGER_DAMAGE);
    s.status = "Hungry";
  }
  for (const s of thirsty) hurt(s, THIRST_DAMAGE);
  for (const s of recovered) s.status = "Healthy";
  for (const s of untreated) hurt(s, UNTREATED_DAMAGE);

  if (hungry.length > 0) {
    report.push({ tone: "red", text: `Food ran out. ${names(hungry, alive)} went without (−${HUNGER_DAMAGE} health).` });
  }
  if (thirsty.length > 0) {
    report.push({ tone: "red", text: `Water ran out. ${names(thirsty, alive)} went without (−${THIRST_DAMAGE} health).` });
  }
  for (const s of recovered) {
    report.push({ tone: "green", text: `${firstName(s)} finally ate and is back on their feet.` });
  }
  for (const s of treated) {
    report.push({ tone: "green", text: `${firstName(s)} was treated with a medicine kit.` });
  }
  for (const s of untreated) {
    report.push({
      tone: "red",
      text: `No medicine left for ${firstName(s)}, who is ${untreatedStatus.get(s)?.toLowerCase()} and got worse (−${UNTREATED_DAMAGE} health).`,
    });
  }

  const ammoNeeded = usageAmount("ammo", alive.length);
  if (supplies.ammo >= ammoNeeded) {
    report.push({ tone: "green", text: `The horde hit the walls after dark. ${ammoNeeded} rounds held them off.` });
  } else {
    for (const s of alive) hurt(s, BREACH_DAMAGE);
    report.push({
      tone: "red",
      text: `Not enough ammo. The horde broke through before you drove them back (−${BREACH_DAMAGE} health to everyone).`,
    });
  }

  for (const s of alive) {
    if (!isAlive(s)) report.push({ tone: "red", text: `${s.name} didn’t make it through the night.` });
  }

  return {
    supplies: applySupplyChange(supplies, {
      food: -usageAmount("food", alive.length),
      water: -usageAmount("water", alive.length),
      medicine: -treated.length * usageAmount("medicine", alive.length),
      ammo: -ammoNeeded,
    }),
    survivors: next,
    report,
  };
}

function firstName(s: Survivor) {
  return s.name.split(" ")[0];
}

function names(list: Survivor[], everyone: Survivor[]) {
  if (list.length === everyone.length) return "Everyone";
  const first = list.map(firstName);
  return first.length > 1 ? `${first.slice(0, -1).join(", ")} and ${first.at(-1)}` : first[0];
}
