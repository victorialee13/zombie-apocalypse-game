import type { ColorStatus } from "./colors";
import { applySupplyChange, usageAmount, type Supplies } from "./supplies";
import { clampHealth, isAlive, type Survivor } from "./survivors";

export const HUNGER_DAMAGE = 15;
export const THIRST_DAMAGE = 20;
export const UNTREATED_DAMAGE = 10;

// The horde grows every night: holding the walls takes more rounds, and a breach hurts more
const HORDE_SIZES = ["A few stragglers", "A small pack", "A crowd", "A large crowd", "A swarm", "A huge swarm", "The whole horde"];
const BREACH_DAMAGE = 15;
const BREACH_GROWTH = 4;
const AMMO_GROWTH = 1.5;

export type Horde = { size: string; ammo: number; breachDamage: number };

export function hordeFor(night: number): Horde {
  const grown = night - 1;
  return {
    size: HORDE_SIZES[Math.min(grown, HORDE_SIZES.length - 1)],
    ammo: usageAmount("ammo", 0) + Math.floor(grown * AMMO_GROWTH),
    breachDamage: BREACH_DAMAGE + grown * BREACH_GROWTH,
  };
}

export type ReportLine = { tone: ColorStatus; text: string };

export type NightResult = {
  supplies: Supplies;
  survivors: Survivor[];
  report: ReportLine[];
};

// The supplies handed out one per person at night; when they run short, the player picks who gets them
export const RATIONED = ["food", "water", "medicine"] as const;
export type Rationed = (typeof RATIONED)[number];

// Survivor ids that receive each rationed supply tonight
export type RationPlan = Record<Rationed, string[]>;

// What going without costs, shown on the ration screen before the night is resolved
export const GO_WITHOUT_DAMAGE: Record<Rationed, number> = {
  food: HUNGER_DAMAGE,
  water: THIRST_DAMAGE,
  medicine: UNTREATED_DAMAGE,
};

export type RationNeed = { candidates: Survivor[]; slots: number };

// Who needs each supply tonight and how many of them the stores can cover
export function rationNeeds(supplies: Supplies, survivors: Survivor[]): Record<Rationed, RationNeed> {
  const alive = survivors.filter(isAlive);
  const patients = alive.filter((s) => s.status === "Sick" || s.status === "Injured");
  const need = (id: Rationed, candidates: Survivor[]) => ({
    candidates,
    slots: Math.min(candidates.length, Math.floor(supplies[id] / usageAmount(id, 1))),
  });
  return { food: need("food", alive), water: need("water", alive), medicine: need("medicine", patients) };
}

// Only worth asking the player when some, but not all, of the people in need can be covered
export function isShort(need: RationNeed) {
  return need.slots > 0 && need.slots < need.candidates.length;
}

export function needsRationing(supplies: Supplies, survivors: Survivor[]) {
  return Object.values(rationNeeds(supplies, survivors)).some(isShort);
}

// The plan used when there's no choice to make: supplies go down the roster until they run out
export function rosterOrderPlan(supplies: Supplies, survivors: Survivor[]): RationPlan {
  const needs = rationNeeds(supplies, survivors);
  const firstIds = ({ candidates, slots }: RationNeed) => candidates.slice(0, slots).map((s) => s.id);
  return { food: firstIds(needs.food), water: firstIds(needs.water), medicine: firstIds(needs.medicine) };
}

/*
 * Everyone eats and drinks, the sick and injured are treated (or get worse when the kits run out),
 * then the horde tests the walls. When stores run short, the plan says who goes without.
 */
export function resolveNight(
  night: number,
  supplies: Supplies,
  survivors: Survivor[],
  plan: RationPlan = rosterOrderPlan(supplies, survivors),
): NightResult {
  const next = survivors.map((s) => ({ ...s }));
  const alive = next.filter(isAlive);
  const report: ReportLine[] = [];
  const hurt = (s: Survivor, amount: number) => {
    s.health = clampHealth(s.health - amount);
  };
  const gets = (id: Rationed) => (s: Survivor) => plan[id].includes(s.id);
  const goesWithout = (id: Rationed) => (s: Survivor) => !plan[id].includes(s.id);

  const patients = alive.filter((s) => s.status === "Sick" || s.status === "Injured");
  const treated = patients.filter(gets("medicine"));
  const untreated = patients.filter(goesWithout("medicine"));
  const untreatedStatus = new Map(untreated.map((s) => [s, s.status]));

  const fed = alive.filter(gets("food"));
  const hungry = alive.filter(goesWithout("food"));
  const watered = alive.filter(gets("water"));
  const thirsty = alive.filter(goesWithout("water"));
  const recovered = fed.filter((s) => s.status === "Hungry");

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

  const horde = hordeFor(night);
  const ammoNeeded = horde.ammo;
  if (supplies.ammo >= ammoNeeded) {
    report.push({ tone: "green", text: `${horde.size} hit the walls after dark. ${ammoNeeded} rounds held them off.` });
  } else {
    for (const s of alive) hurt(s, horde.breachDamage);
    report.push({
      tone: "red",
      text: `${horde.size} hit the walls and you didn’t have the ${ammoNeeded} rounds to hold them. They broke through before you drove them back (−${horde.breachDamage} health to everyone).`,
    });
  }

  for (const s of alive) {
    if (!isAlive(s)) report.push({ tone: "red", text: `${s.name} didn’t make it through the night.` });
  }

  return {
    supplies: applySupplyChange(supplies, {
      food: -fed.length * usageAmount("food", 1),
      water: -watered.length * usageAmount("water", 1),
      medicine: -treated.length * usageAmount("medicine", 1),
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
