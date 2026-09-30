import { useLayoutEffect, useState } from "react";
import {
  TEXT_SCALE_KEY,
  TEXT_SCALES,
  parseTextScale,
  textScalePercent,
  type TextScale,
} from "@/lib/textScale";

function readStored(): TextScale {
  if (typeof window === "undefined") return 1;
  try {
    return parseTextScale(window.localStorage.getItem(TEXT_SCALE_KEY));
  } catch {
    return 1;
  }
}

function paintScale(scale: TextScale) {
  document.documentElement.style.setProperty("--chapter-text-scale", String(scale));
}

export function TextSize({ onAnnounce }: { onAnnounce?: (message: string) => void }) {
  const [scale, setScale] = useState<TextScale>(readStored);
  const [announcement, setAnnouncement] = useState("");

  useLayoutEffect(() => {
    const next = readStored();
    setScale(next);
    paintScale(next);
  }, []);

  function step(dir: -1 | 1) {
    const next = TEXT_SCALES[TEXT_SCALES.indexOf(scale) + dir];
    if (next == null) return;
    setScale(next);
    const message = `Text size ${textScalePercent(next)}`;
    if (onAnnounce) onAnnounce(message);
    else setAnnouncement(message);
    paintScale(next);
    try {
      window.localStorage.setItem(TEXT_SCALE_KEY, String(next));
    } catch {
      /* quota / private mode */
    }
  }

  const atMin = scale === TEXT_SCALES[0];
  const atMax = scale === TEXT_SCALES[TEXT_SCALES.length - 1];

  return (
    <div
      role="group"
      aria-label="Text size"
      className="inline-flex items-stretch border border-fog/40 text-paper"
    >
      <button
        type="button"
        aria-label="Decrease text size"
        disabled={atMin}
        onClick={() => step(-1)}
        className="inline-flex min-h-12 min-w-12 items-center justify-center px-3 font-sans text-sm tracking-[0.12em] uppercase hover:text-brass disabled:opacity-40 disabled:hover:text-paper"
      >
        −
      </button>
      <span
        className="flex min-h-12 min-w-16 items-center justify-center border-x border-fog/40 px-3 font-sans text-sm tracking-[0.12em]"
        suppressHydrationWarning
      >
        {textScalePercent(scale)}
      </span>
      <button
        type="button"
        aria-label="Increase text size"
        disabled={atMax}
        onClick={() => step(1)}
        className="inline-flex min-h-12 min-w-12 items-center justify-center px-3 font-sans text-sm tracking-[0.12em] uppercase hover:text-brass disabled:opacity-40 disabled:hover:text-paper"
      >
        +
      </button>
      {onAnnounce ? null : (
        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>
      )}
    </div>
  );
}
