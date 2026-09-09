import { useLayoutEffect } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { timeline, timelineEras } from "@/data/timeline";

export const Route = createFileRoute("/timeline")({ component: TimelinePage });

function TimelinePage() {
  const hash = useRouterState({ select: (s) => s.location.hash });

  useLayoutEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [hash]);

  return (
    <SiteShell>
      <PageHero
        kicker="1902–1959"
        title="A chronology"
        dek="Figures someone had a reason to write down, set in the order they happened — not the order the papers printed them."
        image="/images/martinez-airfield.jpg"
        imageAlt="The waterfront strip at Martinez"
        compact
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {timelineEras.map((era) => {
          const events = timeline.filter((e) => e.era === era.id);
          return (
            <section key={era.id} id={era.id} className="mb-14 scroll-mt-24">
              <h2 className="kicker mb-6">{era.label}</h2>
              <ol className="relative border-l border-rule pl-6 sm:pl-8">
                {events.map((ev) => (
                  <li key={ev.id} className="relative mb-8 last:mb-0">
                    <span className="absolute top-1.5 -left-[29px] size-2.5 rounded-full bg-brass sm:-left-[37px]" />
                    <p className="text-[0.72rem] tracking-[0.16em] text-brass uppercase">
                      {ev.date}
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-paper">{ev.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-fog">{ev.body}</p>
                    {ev.href ? <EventLink href={ev.href} /> : null}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </SiteShell>
  );
}

function EventLink({ href }: { href: string }) {
  const chapterPrefix = "/chapters/";
  if (href.startsWith(chapterPrefix) && !href.slice(chapterPrefix.length).includes("/")) {
    const slug = href.slice(chapterPrefix.length);
    return (
      <Link
        to="/chapters/$slug"
        params={{ slug }}
        className="mt-3 inline-flex min-h-11 items-center text-[0.7rem] tracking-[0.14em] text-brass uppercase"
      >
        Read on
      </Link>
    );
  }
  if (href === "/aircraft") {
    return (
      <Link
        to="/aircraft"
        className="mt-3 inline-flex min-h-11 items-center text-[0.7rem] tracking-[0.14em] text-brass uppercase"
      >
        Read on
      </Link>
    );
  }
  if (href === "/missions") {
    return (
      <Link
        to="/missions"
        className="mt-3 inline-flex min-h-11 items-center text-[0.7rem] tracking-[0.14em] text-brass uppercase"
      >
        Read on
      </Link>
    );
  }
  if (href === "/archive") {
    return (
      <Link
        to="/archive"
        className="mt-3 inline-flex min-h-11 items-center text-[0.7rem] tracking-[0.14em] text-brass uppercase"
      >
        Read on
      </Link>
    );
  }
  return null;
}
