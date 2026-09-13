import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { chapters } from "@/data/chapters";

export const Route = createFileRoute("/chapters/")({ component: ChaptersIndex });

function ChaptersIndex() {
  return (
    <SiteShell>
      <PageHero
        kicker="The Book"
        title="Fifteen chapters"
        dek="Read in order, or open any chapter the way a family opens a box — wherever the hand lands. The first three have a reading. It will keep playing while you move through the book."
        image="/images/footlocker.jpg"
        imageAlt="The locker arranged: B-15 jacket, crew plate, wallet, and gloves"
        compact
      />
      <ol className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {chapters.map((ch) => (
          <li key={ch.slug} className="border-b border-rule">
            <Link
              to="/chapters/$slug"
              params={{ slug: ch.slug }}
              className="group flex min-h-20 flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span className="w-12 shrink-0 font-display text-2xl text-brass">
                {String(ch.number).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-2xl text-paper group-hover:text-brass">
                    {ch.title}
                  </span>
                  {ch.audio ? (
                    <span className="inline-flex items-center gap-1.5 font-sans text-[0.68rem] tracking-[0.18em] text-brass uppercase">
                      <Headphones className="size-3.5" aria-hidden />
                      Listen
                      <span className="sr-only">
                        . This chapter has a reading.
                      </span>
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  {ch.kicker}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </SiteShell>
  );
}