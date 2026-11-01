import Button from "../../components/Button";
import type { ColorStatus } from "../../game/colors";
import type { OutcomeKind } from "../../game/events";
import { TOTAL_DAYS } from "../../game/rules";
import { isAlive, type Survivor } from "../../game/survivors";
import Modal, { BODY, BUTTON, NOTE_TEXT } from "./Modal";
import { CHIP_TONE, TEXT_TONE } from "./tones";

// How the ending reads depends on how many people made it
function verdict(saved: number, total: number) {
  if (saved === total) return "Not a single soul lost. They’ll tell stories about this shelter.";
  if (saved >= total * 0.7) return "Strong leadership. Most of them owe you their lives.";
  if (saved >= total * 0.4) return "You held on, but the cost was heavy.";
  return "Barely. The few who made it won’t forget the ones who didn’t.";
}

function Stat({ label, value, tone }: { label: string; value: string; tone: ColorStatus }) {
  return (
    <div className="flex flex-col gap-4 rounded border border-line bg-panel-2 px-12 py-10">
      <span className={NOTE_TEXT}>{label}</span>
      <span className={`font-display text-[length:calc(26*var(--t))] ${TEXT_TONE[tone]}`}>{value}</span>
    </div>
  );
}

type EndScreenProps = {
  won: boolean;
  day: number;
  survivors: Survivor[];
  results: OutcomeKind[];
  onPlayAgain: () => void;
};

export default function EndScreen({ won, day, survivors, results, onPlayAgain }: EndScreenProps) {
  const alive = survivors.filter(isAlive);
  const successes = results.filter((kind) => kind === "success").length;

  return (
    <Modal
      width={640}
      label={won ? `DAY ${String(TOTAL_DAYS).padStart(2, "0")} · DAWN` : `DAY ${String(day).padStart(2, "0")} · THE END`}
      title={won ? "You survived" : "The shelter has fallen"}
    >
      <p className={BODY}>
        {won
          ? `The ${TOTAL_DAYS}th night is over. ${alive.length} of ${survivors.length} survivors walk out into the morning. ${verdict(alive.length, survivors.length)}`
          : `Everyone was lost on day ${day}. The radio keeps calling into an empty room.`}
      </p>

      <div className="grid grid-cols-3 gap-8 narrow:grid-cols-1">
        <Stat label="Days survived" value={`${won ? TOTAL_DAYS : day - 1} / ${TOTAL_DAYS}`} tone={won ? "green" : "red"} />
        <Stat label="Survivors saved" value={`${alive.length} / ${survivors.length}`} tone={alive.length > 0 ? "green" : "red"} />
        <Stat label="Successful calls" value={`${successes} / ${results.length}`} tone="amber" />
      </div>

      <div className="flex flex-wrap gap-6">
        {survivors.map((s) => (
          <span
            key={s.id}
            className={`rounded-[3px] border px-[0.7em] py-[0.3em] font-label text-[length:calc(11.5*var(--t))] ${
              isAlive(s) ? CHIP_TONE.green : "border-line text-muted line-through"
            }`}
          >
            {s.name}
          </span>
        ))}
      </div>

      <div className="flex justify-end gap-12 border-t border-line pt-18">
        <Button href="/" className={BUTTON}>
          Main Menu
        </Button>
        <Button variant="primary" className={BUTTON} autoFocus onClick={onPlayAgain}>
          Play again
        </Button>
      </div>
    </Modal>
  );
}
