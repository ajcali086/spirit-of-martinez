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
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-muted">
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

        <NineCounts />

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
            <p className="mt-2 font-sans text-[0.68rem] tracking-[0.14em] text-brass-dim uppercase">
              Serial {m.serial} · {m.dbCount} in the compilation
              {m.divergence ? ` · ${m.divergence}` : ""}
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

function NineCounts() {
  return (
    <section
      id="nine-counts"
      className="mb-16 scroll-mt-28 border border-rule px-5 py-8 sm:px-8"
    >
      <p className="font-sans text-[0.68rem] tracking-[0.22em] text-brass uppercase">
        Nine men, four totals
      </p>
      <h2 className="mt-3 font-display text-3xl text-paper">
        32 · 31 · 31 · 31 · 31 · 31 · 30 · 30 · 28
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog">
        Five men flew the whole tour. Four did not, and no two of them for the
        same reason. Every figure below is the 95th Bomb Group database’s, a
        modern compilation of the group’s crew record. It is not a wartime paper
        issued at Horham. Where it conflicts with a document in the family
        collection, both are given and neither preferred.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <caption className="sr-only">
            Mission counts for Crew 1479 in the 95th Bomb Group database
          </caption>
          <thead>
            <tr className="border-b border-rule text-[0.68rem] tracking-[0.16em] text-muted uppercase">
              <th scope="col" className="py-2 pr-4 font-normal">
                Man
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                Serial
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                Count
              </th>
              <th scope="col" className="py-2 font-normal">
                Divergence
              </th>
            </tr>
          </thead>
          <tbody>
            {crew.map((m) => (
              <tr key={m.id} className="border-b border-rule/70">
                <th
                  scope="row"
                  className="py-3 pr-4 font-display text-base font-normal text-paper"
                >
                  <Link
                    to="/crew/$id"
                    params={{ id: m.id }}
                    className="hover:text-brass"
                  >
                    {m.name}
                  </Link>
                </th>
                <td className="py-3 pr-4 font-sans text-sm text-fog">{m.serial}</td>
                <td className="py-3 pr-4 font-display text-xl text-brass">
                  {m.dbCount}
                </td>
                <td className="py-3 text-sm text-muted">
                  {m.divergence ?? "The whole tour"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 max-w-2xl font-display text-lg leading-relaxed text-fog">
        Two twenty-eights that are not the same number. Frank Calicura’s certified
        figure is twenty-eight operational missions — combat, excluding the food.
        Robert Collins’s database count is also twenty-eight — twenty-five combat
        plus the three drops. Marvin Markus’s family remembered twenty-eight full
        bombing runs. His compilation is thirty-one. That family subtracted the
        food, exactly as the Army’s own certification does.
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        The enlisted serials confirm five of six home cities from a source that is
        not the wallet clipping. Titus’s does not. Serial 39 is the Ninth Service
        Command — the Pacific coast. The Lincoln paper and the Omaha wallet were
        writing about a young man who had already gone west. Stated, not resolved.
      </p>
    </section>
  );
}