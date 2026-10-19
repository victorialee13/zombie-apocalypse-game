import type { ColorStatus } from "./colors";

// prelim statuses, maybe add "Dead"
export type Status = "Healthy" | "Sick" | "Injured" | "Hungry" | "Exhausted" | "Scared";

export type Survivor = {
  id: string;
  name: string;
  role: string;
  health: number;
  status: Status;
};

export const STATUS_COLOR: Record<Status, ColorStatus> = {
  Healthy: "green",
  Sick: "red",
  Injured: "red",
  Hungry: "amber",
  Exhausted: "amber",
  Scared: "amber",
};

export const LOW_HEALTH = 50; // Change to 30 perhaps

//Const profiles (placeholders)
export const STARTING_SURVIVORS: Survivor[] = [
  { id: "maya", name: "Maya Chen", role: "Medic", health: 45, status: "Sick" },
  { id: "vic", name: "Victoria Lee", role: "Scout", health: 90, status: "Healthy" },
  { id: "blake", name: "Blake Butler", role: "Engineer", health: 85, status: "Healthy" },
  { id: "andrei", name: "Andrei Piliguzov", role: "Guard", health: 95, status: "Healthy" },
  { id: "lena", name: "Lena Park", role: "Cook", health: 70, status: "Hungry" },
  { id: "sam", name: "Sam Reyes", role: "Mechanic", health: 40, status: "Injured" },
  { id: "iris", name: "Iris Novak", role: "Teacher", health: 80, status: "Healthy" },
  { id: "theo", name: "Theo Grant", role: "Farmer", health: 60, status: "Exhausted" },
  { id: "ethan", name: "Ethan Chao", role: "Kid · 12", health: 85, status: "Scared" },
  { id: "marcus", name: "Marcus Webb", role: "Ex-Soldier", health: 90, status: "Healthy" },
];

export function isAlive(survivor: Survivor) {
  return survivor.health > 0;
}
