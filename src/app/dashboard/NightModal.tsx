import Button from "../../components/Button";
import type { ReportLine } from "../../game/night";
import { SUPPLY_IDS, SUPPLY_INFO, type Supplies } from "../../game/supplies";
import Modal, { BUTTON, NOTE_TEXT } from "./Modal";
import { FILL_TONE } from "./tones";

type NightModalProps = {
  day: number;
  before: Supplies;
  after: Supplies;
  report: ReportLine[];
  onContinue: () => void;
};

export default function NightModal({ day, before, after, report, onContinue }: NightModalProps) {
  return (
    <Modal width={640} label={`DAY ${String(day).padStart(2, "0")} · NIGHT`} title="Night falls">
      <div className="grid grid-cols-4 gap-8 narrow:grid-cols-2">
        {SUPPLY_IDS.map((id) => {
          const change = after[id] - before[id];
          return (
            <div key={id} className="flex flex-col gap-4 rounded border border-line bg-panel-2 px-12 py-10">
              <span className={NOTE_TEXT}>{SUPPLY_INFO[id].name}</span>
              <span className="text-[length:calc(18*var(--t))]">
                {after[id]} {SUPPLY_INFO[id].unit}
              </span>
              <span
                className={`font-label text-[length:calc(12*var(--t))] ${
                  change < 0 ? "text-blood" : change > 0 ? "text-green" : "text-muted"
                }`}
              >
                {change > 0 ? "+" : change < 0 ? "−" : "±"}
                {Math.abs(change)} tonight
              </span>
            </div>
          );
        })}
      </div>

      <ul className="flex flex-col gap-10">
        {report.map((line) => (
          <li key={line.text} className="flex gap-10 text-[length:calc(16*var(--t))] leading-[1.4]">
            <span className={`mt-[0.45em] size-7 shrink-0 rounded-full ${FILL_TONE[line.tone]}`} />
            {line.text}
          </li>
        ))}
      </ul>

      <div className="flex justify-end border-t border-line pt-18">
        <Button variant="primary" className={BUTTON} onClick={onContinue}>
          On to Day {String(day + 1).padStart(2, "0")}&nbsp;&nbsp;→
        </Button>
      </div>
    </Modal>
  );
}
