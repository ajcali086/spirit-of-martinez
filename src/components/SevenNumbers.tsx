import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { counts } from "@/data/archive";
import { hasCaptainsChart, missions } from "@/data/missions";
import type { Mission } from "@/data/types";
import { cn } from "@/lib/utils";

function borrowed(m: Mission) {
  return !m.aircraft.includes("Spirit");
}

function predicate(figure: string): ((m: Mission) => boolean) | null {
  switch (figure) {
    case "26":
      return (m) => m.kind === "combat" && m.number <= 26;
    case "28":
      return (m) => m.kind === "combat";
    case "30":
      return (m) => !borrowed(m);
    case "31":
      return () => true;
    default:
      return null;
  }
}

export function SevenNumbers() {
  const [active, setActive] = useState("28");
  const [showAll, setShowAll] = useState(false);
  const selected = counts.find((c) => c.figure === active) ?? counts[1];
  const pred = predicate(active);

  const hits = useMemo(() => (pred ? missions.filter(pred) : []), [pred]);
  const list = showAll ? missions : missions.filter(hasCaptainsChart);

  const tally =
    active === "30"
      ? showAll
        ? "29 of 30 symbols accounted for — one is not"
        : "The jacket count runs past the charts. See all."
      : pred
        ? showAll
          ? `${hits.length} of 31 missions highlighted`
          : `${hits.filter(hasCaptainsChart).length} of ${hits.length} on a chart in the locker`
        : "This figure is not a count of the missions below.";

  return (
    <section id="seven-numbers" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6">
      <p className="kicker">Seven numbers</p>
      <h2 className="mt-3 max-w-3xl font-display text-3xl text-paper sm:text-4xl">
        And what each one counts
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog">
        Every figure below is documented. No two of them count the same thing.
        Choose one and the mission record answers — or declines to. Fourteen
        captains’ charts survive in the locker; the list opens on those.
      </p>

      <div
        className="mt-8 grid grid-cols-2 gap-px bg-rule sm:grid-cols-4 lg:grid-cols-7"
        role="group"
        aria-label="Seven counts"
      >
        {counts.map((c) => {
          const pressed = c.figure === active;
          return (
            <button
              key={c.figure}
              type="button"
              aria-pressed={pressed}
              aria-label={`${c.figure}, ${c.label}`}
              onClick={() => setActive(c.figure)}
              className={cn(
                "flex min-h-28 flex-col px-4 py-5 text-left transition-colors",
                pressed ? "bg-ink-mid ring-1 ring-inset ring-brass" : "bg-ink-soft hover:bg-ink",
              )}
            >
              <span className="font-display text-4xl leading-none text-brass">{c.figure}</span>
              <span className="mt-3 text-[0.78rem] leading-snug text-fog">{c.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 border-l-2 border-brass pl-4" aria-live="polite">
        <p className="max-w-3xl text-sm leading-relaxed text-paper sm:text-base">{selected.body}</p>
        <p className="mt-3 text-[0.72rem] tracking-[0.12em] text-muted uppercase">{tally}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!showAll}
          onClick={() => setShowAll(false)}
          className={cn(
            "min-h-11 px-4 text-[0.72rem] tracking-[0.16em] uppercase transition-colors",
            !showAll ? "bg-brass text-ink" : "border border-rule text-fog hover:text-paper",
          )}
        >
          Fourteen
        </button>
        <button
          type="button"
          aria-pressed={showAll}
          onClick={() => setShowAll(true)}
          className={cn(
            "min-h-11 px-4 text-[0.72rem] tracking-[0.16em] uppercase transition-colors",
            showAll ? "bg-brass text-ink" : "border border-rule text-fog hover:text-paper",
          )}
        >
          See all
        </button>
      </div>

      <ol className="mt-4 border-y border-rule">
        {list.map((m) => {
          const on = pred ? pred(m) : false;
          return (
            <li
              key={`${m.number}-${m.date}`}
              className={cn(
                "grid grid-cols-[2.6rem_1fr] gap-x-3 gap-y-0.5 border-b border-rule px-2 py-3 last:border-b-0 sm:grid-cols-[2.6rem_9rem_1fr_12rem] sm:items-baseline sm:px-3",
                on ? "bg-brass/10" : "opacity-30",
              )}
            >
              <span className={cn("font-display text-xl", on ? "text-brass" : "text-muted")}>
                {String(m.number).padStart(2, "0")}
              </span>
              <span className="text-[0.72rem] text-muted max-sm:col-start-2">{m.dateLabel}</span>
              <span className="font-display text-lg text-paper max-sm:col-span-2 max-sm:col-start-2">
                <Link
                  to="/missions"
                  hash={`m-${m.number}`}
                  className="hover:text-brass"
                >
                  {m.target}
                </Link>
                {m.kind === "humanitarian" ? (
                  <span className="ml-2 align-middle text-[0.62rem] tracking-[0.14em] text-brass uppercase">
                    Food drop
                  </span>
                ) : null}
                {borrowed(m) ? (
                  <span className="ml-2 align-middle text-[0.62rem] tracking-[0.14em] text-feather uppercase">
                    Borrowed ship
                  </span>
                ) : null}
              </span>
              <span className="text-xs leading-snug text-muted max-sm:col-span-2 max-sm:col-start-2 sm:text-right">
                {m.aircraft}
              </span>
            </li>
          );
        })}
        {active === "30" && showAll ? (
          <li className="grid grid-cols-[2.6rem_1fr] gap-x-3 border-t border-feather/40 bg-[repeating-linear-gradient(45deg,transparent,transparent_7px,rgba(142,58,50,0.12)_7px,rgba(142,58,50,0.12)_14px)] px-2 py-3 sm:grid-cols-[2.6rem_9rem_1fr_12rem] sm:items-baseline sm:px-3">
            <span className="font-display text-xl text-feather">30</span>
            <span className="text-[0.72rem] text-muted max-sm:col-start-2">—</span>
            <span className="font-display text-lg text-feather max-sm:col-span-2 max-sm:col-start-2">
              The thirtieth symbol
              <span className="ml-2 align-middle text-[0.62rem] tracking-[0.14em] uppercase">
                Unaccounted
              </span>
            </span>
            <span className="text-xs leading-snug text-muted max-sm:col-span-2 max-sm:col-start-2 sm:text-right">
              No mission in the crew record corresponds to it.
            </span>
          </li>
        ) : null}
      </ol>

      <Link
        to="/missions"
        className="mt-6 inline-flex min-h-11 items-center text-[0.72rem] tracking-[0.16em] text-brass uppercase"
      >
        Full mission board
      </Link>
    </section>
  );
}