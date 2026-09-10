import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { PhotoPlate } from "@/components/PhotoPlate";
import { CrewRecords } from "@/components/CrewRecords";
import { crew } from "@/data/crew";
import { BGDB_CREW_URL } from "@/data/missions";

export const Route = createFileRoute("/crew/")({ component: CrewPage });

function CrewPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="Tampa & Avon Park, 1944"
        title="Nine strangers"
        dek="Eight names on a Tampa order in August. A ninth at Avon Park on the sixth of November. No one at the Replacement Training Unit asked whether they would get along."
        image="/images/horham.jpg"
        imageAlt="Horham airfield"
        compact
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <PhotoPlate id="crew" className="mt-0 mb-8" />
        <PhotoPlate id="crew2" />
        <PhotoPlate id="cockpit" />
        <PhotoPlate id="ticket" className="mb-8" />
        <PhotoPlate id="signatures" className="mb-8" />
        <p className="mb-12 max-w-2xl text-sm leading-relaxed text-muted">
          Each man links to the 95th Bomb Group database, a modern compilation
          of the group’s crew record. It is not a wartime paper. The listing
          there is titled{" "}
          <a
            href={BGDB_CREW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brass underline-offset-4 hover:text-paper hover:underline"
          >
            F.J. Calicura, 31
          </a>
          . Where a later notice is on the open web, it sits under his name.
        </p>
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
            <CrewRecords member={m} compact />
          </article>
        ))}
      </div>
    </SiteShell>
  );
}