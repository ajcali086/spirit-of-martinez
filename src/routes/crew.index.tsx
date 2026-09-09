import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { PhotoPlate } from "@/components/PhotoPlate";
import { crew } from "@/data/crew";

export const Route = createFileRoute("/crew/")({ component: CrewPage });

function CrewPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="Avon Park, September 1944"
        title="Nine strangers"
        dek="No one at the Replacement Training Unit asked whether they would get along. The job was to teach them to work, not to like each other — though most crews managed both before it was over."
        image="/images/horham.jpg"
        imageAlt="Horham airfield"
        compact
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <PhotoPlate id="crew" className="mt-0 mb-8" />
        <PhotoPlate id="crew2" />
        <PhotoPlate id="ticket" className="mb-12" />
        {crew.map((m, i) => (
          <article
            key={m.id}
            className="border-b border-rule py-10 first:pt-0 last:border-b-0"
          >
            <p className="text-[0.68rem] tracking-[0.2em] text-brass uppercase">
              {String(i + 1).padStart(2, "0")} · {m.role}
            </p>
            <h2 className="mt-2 font-display text-3xl text-paper">
              <Link
                to="/crew/$id"
                params={{ id: m.id }}
                className="hover:text-brass"
              >
                {m.name}
              </Link>
            </h2>
            <p className="mt-1 text-sm tracking-[0.08em] text-muted uppercase">
              {m.hometown}
            </p>
            {m.photo ? <PhotoPlate id={m.photo} className="mt-6 mb-0" /> : null}
            <p className="mt-5 font-display text-lg leading-relaxed text-fog">{m.wartime}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">{m.after}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}