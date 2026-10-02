import { useLayoutEffect } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { chapterBySlug } from "@/data/chapters";
import { keptEpigraph, keptRows, keptSentenceCount, type KeptRow } from "@/data/kept";
import { photos } from "@/data/photos";
import { coverPageMeta } from "@/lib/og/cover";

export const Route = createFileRoute("/kept")({
  head: () => coverPageMeta("/kept"),
  component: KeptPage,
});

/** Rows grouped under their chapter, in book order. */
const groups = keptRows.reduce<{ slug: string; rows: KeptRow[] }[]>((out, row) => {
  const last = out[out.length - 1];
  if (last?.slug === row.slug) last.rows.push(row);
  else out.push({ slug: row.slug, rows: [row] });
  return out;
}, []);

function KeptPage() {
  const hash = useRouterState({ select: (s) => s.location.hash });

  useLayoutEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    const el = document.getElementById(id);
    if (el instanceof HTMLDetailsElement) el.open = true;
    el?.scrollIntoView({ block: "start" });
  }, [hash]);

  return (
    <SiteShell>
      <PageHero
        kicker="The record"
        title="What It Kept"
        dek="Every sentence in the chapters that uses the word."
        image="/images/archive/namespread"
        imageAlt={photos.namespread.alt}
        compact
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <figure className="border-l-2 border-brass pl-5">
          <blockquote className="font-display text-lg leading-relaxed text-fog sm:text-xl">
            {keptEpigraph.sentences.join(" ")}
          </blockquote>
          <figcaption className="mt-3">
            <Link
              to="/chapters/$slug"
              params={{ slug: keptEpigraph.slug }}
              hash={keptEpigraph.paragraph}
              className={linkClass}
            >
              Read the passage
            </Link>
          </figcaption>
        </figure>

        <p className="mt-10 text-[0.72rem] tracking-[0.16em] text-muted uppercase">
          {keptRows.length} times, in {keptSentenceCount} sentences from the chapters.
        </p>

        {groups.map((group) => {
          const chapter = chapterBySlug(group.slug)!;
          return (
            <section key={group.slug} className="mt-8">
              <h2 className="border-b border-rule pb-2 text-[0.7rem] tracking-[0.16em] text-brass uppercase">
                Chapter {chapter.number} · {chapter.title}
              </h2>
              {group.rows.map((row) => (
                <Row key={row.id} row={row} />
              ))}
            </section>
          );
        })}
      </div>
    </SiteShell>
  );
}

const linkClass =
  "inline-flex min-h-11 items-center text-[0.7rem] tracking-[0.14em] text-brass uppercase hover:text-paper";

/**
 * One occurrence. The summary is the aligned line: the keyword starts every
 * row at the column's centre line, with the words before it running off to
 * the left and the words after it off to the right. Clipping is visual only —
 * the whole sentence is in the DOM in reading order, so copy, search and
 * screen readers get it verbatim.
 */
function Row({ row }: { row: KeptRow }) {
  return (
    <details id={row.id} className="group scroll-mt-24 border-b border-rule/60">
      {/* Two inline-block halves rather than a grid: grid and flex cells are
          block boxes, and copying across them inserts a line break into the
          sentence. The float-right inner span is what clips the left half
          from its start, so the words nearest the keyword stay in view. */}
      <summary className="block cursor-pointer list-none whitespace-nowrap font-display text-base leading-[2.75rem] text-fog hover:text-paper [&::-webkit-details-marker]:hidden">
        <span className="inline-block w-1/2 overflow-hidden align-top [mask-image:linear-gradient(to_right,transparent,#000_2rem)]">
          <span className="float-right whitespace-pre">{row.before}</span>
        </span>
        <span className="inline-block w-1/2 overflow-hidden whitespace-pre align-top [mask-image:linear-gradient(to_left,transparent,#000_2rem)]">
          <span className="italic text-brass">{row.word}</span>
          {row.after}
        </span>
      </summary>
      <div className="pb-4 pt-1">
        <p className="font-display text-base leading-relaxed text-fog">
          {row.before}
          <span className="italic text-brass">{row.word}</span>
          {row.after}
        </p>
        <Link
          to="/chapters/$slug"
          params={{ slug: row.slug }}
          hash={row.paragraph}
          className={linkClass}
        >
          Read the passage
        </Link>
      </div>
    </details>
  );
}
