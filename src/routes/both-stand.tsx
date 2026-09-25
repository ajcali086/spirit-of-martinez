import { useLayoutEffect } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { discrepancies, type Discrepancy } from "@/data/discrepancies";
import { coverPageMeta } from "@/lib/og/cover";

export const Route = createFileRoute("/both-stand")({
  head: () => coverPageMeta("/both-stand"),
  component: BothStandPage,
});

function BothStandPage() {
  const hash = useRouterState({ select: (s) => s.location.hash });

  useLayoutEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [hash]);

  return (
    <SiteShell>
      <PageHero
        kicker="The record"
        title="Both Stand"
        dek="Where the records disagree, and are left in disagreement."
        image="/images/archive/chart7"
        imageAlt="Printed captains’ map of northwest Europe, hand-labeled Mission #7, 23 Feb. 1945"
        imagePosition="top"
        compact
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <figure className="border-l-2 border-brass pl-5">
          <blockquote className="font-display text-lg leading-relaxed text-fog sm:text-xl">
            None of these documents agrees with all the others about exactly
            what happened, or exactly how many times it happened, or exactly
            what it should be called… this book has not resolved that
            disagreement either, and has stopped trying to.
          </blockquote>
          <figcaption className="mt-3">
            <Link
              to="/chapters/$slug"
              params={{ slug: "the-number" }}
              hash="14.5-p2"
              className="inline-flex min-h-11 items-center text-[0.7rem] tracking-[0.14em] text-brass uppercase hover:text-paper"
            >
              Read the passage
            </Link>
          </figcaption>
        </figure>

        <p className="mt-10 text-[0.72rem] tracking-[0.16em] text-muted uppercase">
          {discrepancies.length} disagreements, left standing.
        </p>

        <div className="mt-2">
          {discrepancies.map((entry) => (
            <Entry key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}

const linkClass =
  "inline-flex min-h-11 items-center text-[0.7rem] tracking-[0.14em] text-brass uppercase hover:text-paper";

function Entry({ entry }: { entry: Discrepancy }) {
  return (
    <section
      id={entry.id}
      className="scroll-mt-24 border-t border-rule py-8 first:border-t-0"
    >
      <h2 className="font-display text-2xl text-paper">{entry.title}</h2>

      <div className="mt-4 space-y-3 border-l border-rule pl-4">
        {entry.claims ? (
          entry.claims.map((claim) => (
            <p key={claim} className="text-sm leading-relaxed text-fog">
              {claim}
            </p>
          ))
        ) : (
          <p className="text-sm leading-relaxed text-fog">{entry.note}</p>
        )}
      </div>

      <p className="mt-4 font-display text-lg italic text-brass">{entry.close}</p>

      <div className="mt-1 flex flex-wrap items-center gap-x-6">
        {entry.paragraph ? (
          <Link
            to="/chapters/$slug"
            params={{ slug: entry.paragraph.slug }}
            hash={entry.paragraph.anchor}
            className={linkClass}
          >
            Read the passage
          </Link>
        ) : null}
        {entry.plate ? (
          <Link to="/archive/$id" params={{ id: entry.plate }} className={linkClass}>
            See the plate
          </Link>
        ) : null}
        {entry.mission != null ? (
          <Link to="/missions" hash={`map-${entry.mission}`} className={linkClass}>
            Find the pin
          </Link>
        ) : null}
      </div>
    </section>
  );
}
