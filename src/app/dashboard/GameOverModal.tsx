import Button from "../../components/Button";
import { TOTAL_DAYS } from "../../game/rules";
import { isAlive, type Survivor } from "../../game/survivors";
import Modal, { BODY, BUTTON, NOTE_TEXT } from "./Modal";
import { FILL_TONE } from "./tones";

type GameOverModalProps = {
  day: number; // the last day played
  survivors: Survivor[];
  onRestart: () => void;
};

export default function GameOverModal({ day, survivors, onRestart }: GameOverModalProps) {
  const alive = survivors.filter(isAlive);
  const won = alive.length > 0;

  return (
    <Modal
      width={640}
      label={won ? `DAY ${String(day).padStart(2, "0")} · RESCUE` : `DAY ${String(day).padStart(2, "0")} · GAME OVER`}
      title={won ? "You made it" : "No one survived"}
    >
      <p className={BODY}>
        {won
          ? `The rescue convoy arrived at dawn after ${TOTAL_DAYS} days. ${alive.length} of ${survivors.length} survivors climbed aboard.`
          : `The camp fell silent on night ${day}. Nobody was left to see the rescue convoy.`}
      </p>

      <ul className="grid grid-cols-2 gap-x-16 gap-y-8 narrow:grid-cols-1">
        {survivors.map((s) => {
          const living = isAlive(s);
          return (
            <li key={s.id} className={`flex items-center gap-10 ${living ? "" : "opacity-50"}`}>
              <span className={`size-7 shrink-0 rounded-full ${living ? FILL_TONE.green : FILL_TONE.red}`} />
              <span className="text-[length:calc(16*var(--t))]">{s.name}</span>
              <span className={`${NOTE_TEXT} ml-auto`}>{living ? `${s.health} health` : "Dead"}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end gap-12 border-t border-line pt-18">
        <Button href="/" className={BUTTON}>
          Main menu
        </Button>
        <Button variant="primary" className={BUTTON} onClick={onRestart}>
          Play again&nbsp;&nbsp;→
        </Button>
      </div>
    </Modal>
  );
}
