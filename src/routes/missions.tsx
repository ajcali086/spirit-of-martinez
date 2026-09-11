import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { PhotoPlate } from "@/components/PhotoPlate";
import {
  BGDB_CREW_URL,
  bgdbMissionUrl,
  eighthMissionUrl,
  hasCaptainsChart,
  missionChapter,
  missionPeople,
  missions,
} from "@/data/missions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/missions")({ component: MissionsPage });

function MissionsPage() {
  const hash = useRouterState({ select: (s) => s.location.hash });
  const [filter, setFilter] = useState<"charts" | "all" | "combat" | "humanitarian">("charts");
  const list = useMemo(() => {
    if (filter === "charts") return missions.filter(hasCaptainsChart);
    if (filter === "all") return missions;
    return missions.filter((m) => m.kind === filter);
  }, [filter]);

  useEffect(() => {
    const n = Number(String(hash).replace(/^#?m-/, ""));
    if (!Number.isFinite(n) || n < 1) return;
    if (n >= 29) setFilter("humanitarian");
    else if (n > 14) setFilter("all");
    requestAnimationFrame(() => {
      document.getElementById(`m-${n}`)?.scrollIntoView({ block: "center" });
    });
  }, [hash]);

  return (
    <SiteShell>
      <PageHero
        kicker="The board"
        title="Thirty-one sorties"
        dek="Twenty-eight combat missions, three humanitarian drops. Joyce numbered the scrapbook to twenty-eight. The food carries no number at all."
        image="/images/hero-fortress.jpg"
        imageAlt="The locker arranged: B-15 jacket, crew plate, wallet, and gloves"
        compact
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["charts", "Fourteen"],
              ["all", "See all"],
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

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          Fourteen captains’ charts survive in the locker, missions one through
          fourteen without a gap. The list opens on those. The rest of the tour
          is in the crew record. Each combat sortie links to two modern
          compilations: the 95th Bomb Group database, and the Eighth Air Force
          day page in the Imperial War Museums American Archive. Neither is a
          wartime paper issued at Horham. The three food drops have no matching
          8th AF day page. The crew listing in the group database is titled{" "}
          <a
            href={BGDB_CREW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brass underline-offset-4 hover:text-paper hover:underline"
          >
            F.J. Calicura, 31
          </a>
          . That figure belongs among the{" "}
          <Link
            to="/archive"
            hash="seven-numbers"
            className="text-brass underline-offset-4 hover:text-paper hover:underline"
          >
            seven counts
          </Link>
          . Each morning also opens the chapter that already tells it.
        </p>

        <PhotoPlate id="chart7" className="mt-10" />

        <ol className="mt-8 divide-y divide-rule border-y border-rule">
          {list.map((m) => {
            const chapter = missionChapter(m);
            const people = missionPeople(m);
            return (
              <li
                key={`${m.number}-${m.date}`}
                id={`m-${m.number}`}
                className="grid scroll-mt-28 gap-3 py-6 sm:grid-cols-[4.5rem_1fr_11rem] sm:gap-6"
              >
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
                  <div className="mt-3 flex flex-wrap items-center gap-x-5">
                    <Link
                      to="/chapters/$slug"
                      params={{ slug: chapter.slug }}
                      hash={chapter.hash}
                      className="inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-brass uppercase hover:text-paper"
                    >
                      {chapter.label}
                    </Link>
                    <Link
                      to="/aircraft"
                      className="inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-brass uppercase hover:text-paper"
                    >
                      The aircraft
                    </Link>
                    {people.map((p) => (
                      <Link
                        key={p.id}
                        to="/crew/$id"
                        params={{ id: p.id }}
                        className="inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-brass uppercase hover:text-paper"
                      >
                        {p.name}
                      </Link>
                    ))}
                    <a
                      href={bgdbMissionUrl(m.record)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-brass uppercase hover:text-paper"
                    >
                      95th BG database
                    </a>
                    {m.eighth && m.eighthSlug ? (
                      <a
                        href={eighthMissionUrl(m.eighthSlug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-brass uppercase hover:text-paper"
                      >
                        8th AF {m.eighth}
                      </a>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm leading-snug text-muted sm:text-right">
                  <Link
                    to="/aircraft"
                    className="hover:text-brass"
                  >
                    {m.aircraft}
                  </Link>
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </SiteShell>
  );
}