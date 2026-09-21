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
        className="mt-8 flex flex-wrap gap-px bg-rule"
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
                "flex min-h-[5.25rem] min-w-[calc(50%-1px)] flex-1 flex-col px-3 py-4 text-left sm:min-h-24 sm:min-w-[calc(25%-1px)] sm:px-4 lg:min-w-[calc(14%-1px)]",
                pressed
                  ? "bg-ink-mid ring-1 ring-inset ring-brass"
                  : "bg-ink-soft hover:bg-ink",
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

      {pred ? (
        <>
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
              const on = pred(m);
              return (
                <li
                  key={`${m.number}-${m.date}`}
                  className={cn(
                    "grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 border-b border-rule py-2 last:border-b-0",
                    on ? "bg-brass/10" : "opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "pt-0.5 font-display text-lg leading-none tabular-nums",
                      on ? "text-brass" : "text-muted",
                    )}
                  >
                    {String(m.number).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                      <Link
                        to="/missions"
                        hash={`m-${m.number}`}
                        className="font-display text-[1.05rem] leading-snug text-paper hover:text-brass"
                      >
                        {m.target}
                      </Link>
                      {m.kind === "humanitarian" ? (
                        <span className="text-[0.62rem] tracking-[0.14em] text-brass uppercase">
                          Food drop
                        </span>
                      ) : null}
                      {borrowed(m) ? (
                        <span className="text-[0.62rem] tracking-[0.14em] text-feather uppercase">
                          Borrowed
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2 text-[0.7rem] leading-snug text-muted">
                      <time dateTime={m.date}>{m.dateLabel}</time>
                      <span aria-hidden>·</span>
                      <span className="min-w-0">{m.aircraft}</span>
                    </span>
                  </span>
                </li>
              );
            })}
            {active === "30" && showAll ? (
              <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 border-t border-feather/40 bg-[repeating-linear-gradient(45deg,transparent,transparent_7px,rgba(142,58,50,0.12)_7px,rgba(142,58,50,0.12)_14px)] py-2">
                <span className="pt-0.5 font-display text-lg leading-none text-feather">
                  30
                </span>
                <span className="min-w-0">
                  <span className="font-display text-[1.05rem] leading-snug text-feather">
                    The thirtieth symbol
                    <span className="ml-2 align-middle text-[0.62rem] tracking-[0.14em] uppercase">
                      Unaccounted
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[0.7rem] leading-snug text-muted">
                    No mission in the crew record corresponds to it.
                  </span>
                </span>
              </li>
            ) : null}
          </ol>
        </>
      ) : null}

      <Link
        to="/missions"
        className="mt-6 inline-flex min-h-11 items-center text-[0.72rem] tracking-[0.16em] text-brass uppercase"
      >
        Full mission board
      </Link>
    </section>
  );
}