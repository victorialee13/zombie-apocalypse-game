"use client";

import { useRouter } from "next/navigation";
import SettingsPage from "./SettingsPage";

export default function Settings() {
  const router = useRouter();
  return <SettingsPage onBack={() => router.push("/")} />;
}
