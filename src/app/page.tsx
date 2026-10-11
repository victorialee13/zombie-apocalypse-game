import Link from "next/link";

// Placeholder until the real landing page is added
export default function LandingPage() {
  return (
    <main style={{ padding: 48, fontFamily: "serif" }}>
      <h1>Landing page goes here</h1>
      <Link href="/settings" style={{ color: "#d9a441" }}>
        Settings
      </Link>
    </main>
  );
}
