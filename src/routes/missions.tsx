import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { PhotoPlate } from "@/components/PhotoPlate";
import { missions } from "@/data/missions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/missions")({ component: MissionsPage });

function MissionsPage() {
  const [filter, setFilter] = useState<"all" | "combat" | "humanitarian">("all");
  const list = useMemo(
    () => (filter === "all" ? missions : missions.filter((m) => m.kind === filter)),
    [filter],
  );

  return (
    <SiteShell>
      <PageHero
        kicker="The board"
        title="Thirty-one sorties"
        dek="Twenty-eight combat missions, three humanitarian drops. Joyce numbered the scrapbook to twenty-eight. The food carries no number at all."
        image="/images/hero-fortress.jpg"
        imageAlt="A B-17 over cloud"
        compact
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["combat", "Combat"],
              ["humanitarian", "Chowhound"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "min-h-11 px-4 text-[0.72rem] tracking-[0.16em] uppercase transition-colors",
                filter === id
                  ? "bg-brass text-ink"
                  : "border border-rule text-fog hover:text-paper",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <PhotoPlate id="chart7" className="mt-10" />

        <ol className="mt-8 divide-y divide-rule border-y border-rule">
          {list.map((m) => (
            <li key={`${m.number}-${m.date}`} className="grid gap-3 py-6 sm:grid-cols-[4.5rem_1fr_11rem] sm:gap-6">
              <p
                className={
                  m.kind === "humanitarian"
                    ? "font-display text-lg tracking-widest text-brass uppercase"
                    : "font-display text-3xl text-brass"
                }
              >
                {m.kind === "humanitarian" ? "Food" : String(m.number).padStart(2, "0")}
              </p>
              <div>
                <h2 className="font-display text-2xl text-paper">{m.target}</h2>
                <p className="mt-1 text-[0.72rem] tracking-[0.12em] text-muted uppercase">
                  {m.dateLabel}
                  {m.kind === "humanitarian" ? " · Humanitarian" : ""}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-fog">{m.notes}</p>
                {m.clipping ? (
                  <p className="mt-2 font-display text-sm text-brass italic">
                    “{m.clipping}”
                  </p>
                ) : null}
              </div>
              <p className="text-sm leading-snug text-muted sm:text-right">{m.aircraft}</p>
            </li>
          ))}
        </ol>
      </div>
    </SiteShell>
  );
}
