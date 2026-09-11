import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PhotoPlate } from "@/components/PhotoPlate";
import { adjacentChapters, chapterBySlug, chapters } from "@/data/chapters";
import type { Block } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chapters/$slug")({
  component: ChapterPage,
});

function ChapterPage() {
  const { slug } = Route.useParams();
  const chapter = chapterBySlug(slug);
  if (!chapter) {
    throw notFound();
  }
  const { prev, next } = adjacentChapters(slug);
  let firstPara = true;

  return (
    <SiteShell>
      <article>
        <header className="relative overflow-hidden border-b border-rule">
          <img
            src={chapter.image}
            alt={chapter.imageAlt}
            className={cn(
              "absolute inset-0 size-full object-cover",
              chapter.imagePosition === "top" && "object-top",
            )}
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/80 to-ink/30" />
          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="kicker">
              Chapter {String(chapter.number).padStart(2, "0")} · {chapter.years}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold text-paper sm:text-6xl">
              {chapter.title}
            </h1>
            <p className="mt-4 font-display text-lg text-fog italic">{chapter.kicker}</p>
          </div>
        </header>

        <nav
          aria-label="Chapters"
          className="sticky top-16 z-30 overflow-x-auto border-b border-paper-deep/40 bg-paper"
        >
          <ol className="mx-auto flex max-w-3xl gap-1 px-3 py-2">
            {chapters.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/chapters/$slug"
                  params={{ slug: c.slug }}
                  className={`flex size-9 items-center justify-center font-display text-sm ${
                    c.slug === slug
                      ? "bg-ink text-paper"
                      : "text-ink-soft/60 hover:text-ink"
                  }`}
                  aria-current={c.slug === slug ? "page" : undefined}
                  aria-label={`Chapter ${c.number}: ${c.title}`}
                >
                  {c.number}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="bg-paper">
          <div className="prose-archive mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="mb-10 font-sans text-[0.72rem] leading-relaxed tracking-[0.14em] text-brass-dim uppercase">
              {chapter.dek}
            </p>
            {chapter.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="mb-14 scroll-mt-28"
              >
                {section.title ? (
                  <header className="mb-6">
                    <p className="font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase">
                      {section.id}
                    </p>
                    <h2 className="mt-2 font-display text-3xl text-ink">{section.title}</h2>
                    {section.place ? (
                      <p className="mt-1 font-display text-base text-muted italic">
                        {section.place}
                      </p>
                    ) : null}
                  </header>
                ) : null}
                {section.blocks.map((block, i) => {
                  const node = renderBlock(block, firstPara && block.type === "p");
                  if (firstPara && block.type === "p") firstPara = false;
                  return <div key={`${section.id}-${i}`}>{node}</div>;
                })}
              </section>
            ))}
          </div>
        </div>

        <nav className="border-t border-rule bg-ink-soft">
          <div className="mx-auto grid max-w-3xl gap-0 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/chapters/$slug"
                params={{ slug: prev.slug }}
                className="flex min-h-24 flex-col justify-center gap-1 border-b border-rule px-6 py-6 sm:border-r sm:border-b-0"
              >
                <span className="flex items-center gap-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                  <ArrowLeft className="size-3.5" /> Previous
                </span>
                <span className="font-display text-xl text-paper">{prev.title}</span>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {next ? (
              <Link
                to="/chapters/$slug"
                params={{ slug: next.slug }}
                className="flex min-h-24 flex-col justify-center gap-1 px-6 py-6 text-right"
              >
                <span className="flex items-center justify-end gap-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                  Next <ArrowRight className="size-3.5" />
                </span>
                <span className="font-display text-xl text-paper">{next.title}</span>
              </Link>
            ) : null}
          </div>
        </nav>
      </article>
    </SiteShell>
  );
}

function renderBlock(block: Block, dropCap: boolean) {
  if (block.type === "quote") {
    return (
      <blockquote className="quote-pull">
        {block.text}
        {block.cite ? (
          <footer className="mt-2 font-sans text-[0.68rem] tracking-[0.14em] text-muted not-italic uppercase">
            {block.cite}
          </footer>
        ) : null}
      </blockquote>
    );
  }
  if (block.type === "note") {
    return (
      <aside className="my-6 border border-brass/30 bg-paper-deep px-4 py-3 font-sans text-sm leading-relaxed text-ink-soft">
        {block.text}
      </aside>
    );
  }
  if (block.type === "artifact") {
    return (
      <aside className="my-6 border-l-2 border-feather bg-paper-deep/70 px-4 py-3">
        <p className="font-sans text-[0.68rem] tracking-[0.18em] text-feather uppercase">
          {block.title}
        </p>
        <p className="mt-1 font-display text-lg text-ink">{block.body}</p>
      </aside>
    );
  }
  if (block.type === "figure") {
    return <PhotoPlate id={block.id} caption={block.caption} tone="paper" />;
  }
  return (
    <p
      id={block.id}
      className={cn(dropCap && "drop-cap", block.id && "scroll-mt-28")}
    >
      {block.text}
    </p>
  );
}
