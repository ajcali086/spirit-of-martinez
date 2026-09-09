import { useLayoutEffect } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { ObjectCatalog } from "@/components/ObjectCatalog";
import { SevenNumbers } from "@/components/SevenNumbers";
import { artifacts, decorations, openQuestions } from "@/data/archive";

export const Route = createFileRoute("/archive/")({ component: ArchivePage });

function ArchivePage() {
  const hash = useRouterState({ select: (s) => s.location.hash });

  useLayoutEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [hash]);

  return (
    <SiteShell>
      <PageHero
        kicker="The footlocker"
        title="What the paperwork says, and what it cannot settle"
        dek="None of these documents agrees with all the others about exactly what happened, or exactly how many times it happened. Fourteen chapters into trying, the book stopped trying to resolve that. A family kept everything anyway."
        image="/images/footlocker.jpg"
        imageAlt="A still life of wartime objects"
      />

      <SevenNumbers />

      <section className="border-y border-rule bg-ink-soft">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="kicker">Decorations</h2>
          <ul className="mt-6 divide-y divide-rule border-y border-rule">
            {decorations.map((d) => (
              <li
                key={d.name}
                className="flex min-h-14 flex-col justify-center gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="font-display text-xl text-paper">{d.name}</span>
                <span className="text-sm text-muted">{d.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="kicker">Objects</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {artifacts.map((a) => (
            <article key={a.title} className="border-l-2 border-brass pl-4">
              <h3 className="font-display text-xl text-paper">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-rule bg-paper text-ink">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-sans text-[0.72rem] tracking-[0.22em] text-feather uppercase">
            The plates
          </h2>
          <p className="mt-3 max-w-2xl font-display text-2xl text-ink">
            Photographs and objects the family kept. Each one has its own address.
            The mission reports document targets, tonnage, losses, and times.
            These document a dirt strip, a wet street, a handshake, a name on the
            nose, and the papers that would not agree.
          </p>
          <div className="mt-10">
            <ObjectCatalog />
          </div>
        </div>
      </section>

      <section className="border-t border-paper-deep bg-paper text-ink">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="font-sans text-[0.72rem] tracking-[0.22em] text-feather uppercase">
            Questions left open
          </h2>
          <p className="mt-3 font-display text-2xl text-ink">
            These are not gaps awaiting a tidier draft. They are the points at which the surviving record stops.
          </p>
          <ul className="mt-10 space-y-8">
            {openQuestions.map((q) => (
              <li key={q.title}>
                <h3 className="font-display text-xl text-ink">{q.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft/80">{q.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}