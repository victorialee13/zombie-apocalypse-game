import Button from "../components/Button";

const CREDITS = ["Soliday Ek", "Victoria Lee", "Andrei Piliguzov", "Ethan Chao"];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-vignette px-6 py-12">
      <h1 className="mb-[22px] text-center font-display text-[length:min(172px,17vw)] leading-[0.88] uppercase">
        <span className="block">Zombie</span>
        <span className="block">Apocalypse</span>
      </h1>

      {/* How to Play replays the dashboard tutorial. Continue opens the dashboard until saving exists */}
      <nav className="grid w-[340px] max-w-full grid-cols-2 gap-x-3 gap-y-[13px]">
        <Button href="/dashboard" variant="primary" className="col-span-2">
          Start
        </Button>
        <Button href="/dashboard" className="col-span-2">
          Continue
        </Button>
        <Button href="/dashboard?tutorial" className="px-0">
          How to Play
        </Button>
        <Button href="/settings" className="px-0">
          Settings
        </Button>
      </nav>

      <div className="mt-[29px] flex h-[38px] w-[490px] max-w-full items-center gap-2.5 overflow-hidden rounded border border-blood/50 bg-black/45 px-4 text-[13px] whitespace-nowrap text-muted">
        <span className="size-[9px] shrink-0 animate-live-pulse rounded-full bg-blood" />
        <span className="font-mono text-xs tracking-[0.18em] text-blood">LIVE</span>
        <span className="truncate">
          “…if anyone hears this, please come help me. I’m located under Station 4…”
        </span>
      </div>

      <p className="mt-7 text-center font-display text-[15px] tracking-[0.2em] text-muted [font-variant-caps:small-caps]">
        {CREDITS.join(" - ")}
      </p>
    </main>
  );
}
