import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { PhotoPlate } from "@/components/PhotoPlate";
import { SevenNumbers } from "@/components/SevenNumbers";
import { artifacts, decorations, openQuestions } from "@/data/archive";
import { objects, photographs } from "@/data/photos";

export const Route = createFileRoute("/archive")({ component: ArchivePage });

function ArchivePage() {
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
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="font-sans text-[0.72rem] tracking-[0.22em] text-feather uppercase">
            Photographs
          </h2>
          <p className="mt-3 max-w-2xl font-display text-2xl text-ink">
            Plates the family kept. The mission reports document targets, tonnage,
            losses, and times. These document a dirt strip by the tracks, a wet
            street, a handshake, a name on the nose, smoke over a yard, a
            newsroom, a cutting block, and a sidewalk in Watts.
          </p>
          {photographs.map((p, i) => (
            <PhotoPlate
              key={p.id}
              id={p.id}
              tone="paper"
              className={i === 0 ? "mt-10" : undefined}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-paper-deep bg-paper text-ink">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="font-sans text-[0.72rem] tracking-[0.22em] text-feather uppercase">
            What a family kept
          </h2>
          <p className="mt-3 max-w-2xl font-display text-2xl text-ink">
            A card, a bill, a ticket, a wallet, a jacket, a patch, a form, a
            letter, a chart. None of them agrees with all the others about
            exactly how many times it happened.
          </p>
          {objects.map((p, i) => (
            <PhotoPlate
              key={p.id}
              id={p.id}
              tone="paper"
              className={i === 0 ? "mt-10" : i === objects.length - 1 ? "mb-0" : undefined}
            />
          ))}
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
