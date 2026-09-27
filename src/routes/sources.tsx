import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { PhotoPlate } from "@/components/PhotoPlate";
import {
  closing,
  methodRules,
  provenance,
  readingNote,
  sourceAnchor,
  sourceBlockId,
  sourceClasses,
} from "@/data/sources";
import type { Block } from "@/data/types";
import { coverPageMeta } from "@/lib/og/cover";

export const Route = createFileRoute("/sources")({
  head: () => coverPageMeta("/sources"),
  component: SourcesPage,
});

function Blocks({ blocks, idPrefix }: { blocks: Block[]; idPrefix: string }) {
  return (
    <>
      {blocks.map((b, i) => {
        const id = sourceBlockId(idPrefix, i);
        if (b.type === "note") {
          return (
            <p
              key={i}
              id={id}
              className="mt-4 scroll-mt-28 border-l-2 border-brass pl-4 text-sm leading-relaxed text-paper"
            >
              {b.text}
            </p>
          );
        }
        if (b.type === "p") {
          return (
            <p
              key={i}
              id={id}
              className="mt-4 scroll-mt-28 [overflow-wrap:anywhere] leading-relaxed text-fog"
            >
              {b.text}
            </p>
          );
        }
        if (b.type === "figure") {
          return <PhotoPlate key={i} id={b.id} caption={b.caption} tone="ink" />;
        }
        return null;
      })}
    </>
  );
}

function SourcesPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="A note on sources"
        title="Who supplied a piece of evidence, and how close to it they stood"
        dek="Four kinds of material sit behind every page of this book. They do not agree with one another, and where they disagree the disagreement is stated rather than settled."
        image="/images/archive/gazette.jpg"
        imageAlt="First Lieutenant Frank Calicura in khaki uniform seated beside bound volumes of the Contra Costa Gazette"
      />

      <section id="provenance" className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="kicker">Provenance</h2>
        <Blocks blocks={provenance} idPrefix="provenance" />
      </section>

      <section
        id="reading"
        className="mx-auto max-w-3xl scroll-mt-24 px-4 pb-14 sm:px-6"
      >
        <h2 className="kicker">The reading</h2>
        <p className="mt-4 leading-relaxed text-fog">{readingNote}</p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <h2 className="kicker">Start here</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog">
          Two doors into chapters already written. The method is the same in
          both: what the papers say, and what they cannot settle.
        </p>
        <ul className="mt-8 divide-y divide-rule border-y border-rule">
          <li className="py-6">
            <p className="font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase">
              Chapter 14
            </p>
            <Link
              to="/chapters/$slug"
              params={{ slug: "the-number" }}
              className="mt-2 block font-display text-2xl text-paper hover:text-brass"
            >
              The Number
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Why the records disagree. Seven counts attached to one man. Nine
              attached to nine, on the crew page. None of them is a lie.
            </p>
          </li>
          <li className="py-6">
            <p className="font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase">
              Chapter 12
            </p>
            <Link
              to="/chapters/$slug"
              params={{ slug: "utrecht" }}
              className="mt-2 block font-display text-2xl text-paper hover:text-brass"
            >
              Utrecht
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Four hundred feet. Flour and chocolate. The war from the ground’s
              view, as the bomb bay saw it.
            </p>
          </li>
          <li className="py-6">
            <p className="font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase">
              The collection
            </p>
            <Link
              to="/archive"
              className="mt-2 block font-display text-2xl text-paper hover:text-brass"
            >
              The footlocker
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The papers, the plates, and the seven counts. None of them agrees
              with all of the others.
            </p>
          </li>
        </ul>
      </section>

      <section className="border-y border-rule bg-ink-soft">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="kicker">The four classes of material</h2>
          <ol className="mt-8 space-y-12">
            {sourceClasses.map((c) => (
              <li key={c.name} id={sourceAnchor(c.name)} className="scroll-mt-28">
                <p className="font-sans text-[0.72rem] tracking-[0.22em] text-feather uppercase">
                  {c.ordinal}
                </p>
                <h3 className="mt-2 font-display text-2xl text-paper">{c.name}</h3>
                <Blocks blocks={c.blocks} idPrefix={sourceAnchor(c.name)} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="kicker">How conflicts are handled</h2>
        <dl className="mt-8 divide-y divide-rule border-y border-rule">
          {methodRules.map((r) => (
            <div key={r.rule} id={sourceAnchor(r.rule)} className="scroll-mt-28 py-5">
              <dt className="font-display text-xl text-paper">{r.rule}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{r.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-rule bg-paper text-ink">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          {closing.map((b, i) =>
            b.type === "p" ? (
              <p
                key={i}
                id={sourceBlockId("sources-close", i)}
                className="scroll-mt-28 font-display text-2xl leading-snug text-ink"
              >
                {b.text}
              </p>
            ) : null,
          )}
        </div>
      </section>
    </SiteShell>
  );
}
