import type { ColorStatus } from "./colors";

export const SUPPLY_IDS = ["food", "water", "medicine", "ammo"] as const;
export type SupplyId = (typeof SUPPLY_IDS)[number];

type Usage = { per: "day"; perSurvivor: number } | { per: "raid" | "patient"; amount: number };

type SupplyInfo = {
  name: string;
  unit: string;
  capacity: number;
  color: ColorStatus;
  usage: Usage;
};

export const SUPPLY_INFO: Record<SupplyId, SupplyInfo> = {
  food: { name: "Food", unit: "rations", capacity: 50, color: "amber", usage: { per: "day", perSurvivor: 1 } },
  water: { name: "Water", unit: "L", capacity: 50, color: "blue", usage: { per: "day", perSurvivor: 1 } },
  medicine: { name: "Medicine", unit: "kits", capacity: 20, color: "purple", usage: { per: "patient", amount: 1 } },
  ammo: { name: "Weapons & Ammo", unit: "rounds", capacity: 76, color: "green", usage: { per: "raid", amount: 6 } },
};

export const LOW_SUPPLY_FRACTION = 0.2;

export type Supplies = Record<SupplyId, number>;

export const STARTING_SUPPLIES: Supplies = {
  food: 18,
  water: 24,
  medicine: 3,
  ammo: 42,
};


export function applySupplyChange(current: Supplies, change: Partial<Supplies>): Supplies {
  const next = { ...current };
  for (const id of SUPPLY_IDS) {
    const amount = current[id] + (change[id] ?? 0);
    next[id] = Math.max(0, Math.min(SUPPLY_INFO[id].capacity, amount));
  }
  return next;
}

export function isLow(id: SupplyId, amount: number) {
  return amount <= SUPPLY_INFO[id].capacity * LOW_SUPPLY_FRACTION;
}

export function usageAmount(id: SupplyId, aliveCount: number) {
  const { usage } = SUPPLY_INFO[id];
  return usage.per === "day" ? usage.perSurvivor * aliveCount : usage.amount;
}
