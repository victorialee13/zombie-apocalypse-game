"use client";

import { useEffect, useState } from "react";
import { loadSettings, textDelay } from "../game/settings";

type TypedTextProps = {
  text: string;
  className?: string;
};

/*
 * Story text typed out a letter at a time, at the Text speed setting. The letters still to come are
 * there but invisible, so the card keeps its final size. Clicking the text shows the rest at once.
 */
export default function TypedText({ text, className }: TypedTextProps) {
  const [delay] = useState(() => textDelay(loadSettings().textSpeed));
  const [shown, setShown] = useState(delay === 0 ? text.length : 0);
  const done = shown >= text.length;

  // Start over when the text changes, such as the story giving way to the outcome
  useEffect(() => {
    setShown(delay === 0 ? text.length : 0);
  }, [text, delay]);

  useEffect(() => {
    if (done) return;
    const timer = setTimeout(() => setShown((n) => n + 1), delay);
    return () => clearTimeout(timer);
  }, [shown, done, delay]);

  return (
    <p className={className} aria-label={text} onClick={() => setShown(text.length)}>
      <span aria-hidden>{text.slice(0, shown)}</span>
      {!done && (
        <span aria-hidden className="invisible">
          {text.slice(shown)}
        </span>
      )}
    </p>
  );
}
