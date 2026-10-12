"use client";

import { STARTING_SUPPLIES } from "../../game/supplies";
import { STARTING_SURVIVORS } from "../../game/survivors";
import DashboardPage from "./DashboardPage";

export default function Dashboard() {
  return (
    <DashboardPage
      day={1}
      supplies={STARTING_SUPPLIES}
      survivors={STARTING_SURVIVORS}
      onBeginDay={() => {}}
    />
  );
}
