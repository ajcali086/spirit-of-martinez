import { createFileRoute, Link } from "@tanstack/react-router";
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
        dek="Read in order, or open any chapter the way a family opens a box — wherever the hand lands."
        image="/images/footlocker.jpg"
        imageAlt="Wartime objects from a footlocker"
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
                <span className="block font-display text-2xl text-paper group-hover:text-brass">
                  {ch.title}
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
