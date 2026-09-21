import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { PhotoPlate } from "@/components/PhotoPlate";
import { GraphicAccent } from "@/components/GraphicAccent";
import { aircraft } from "@/data/aircraft";
import { coverPageMeta } from "@/lib/og/cover";

export const Route = createFileRoute("/aircraft")({
  head: () => coverPageMeta("/aircraft"),
  component: AircraftPage,
});

function AircraftPage() {
  return (
    <SiteShell>
      <PageHero
        kicker={aircraft.serial}
        title={aircraft.name}
        dek={`${aircraft.type}. Assigned to the ${aircraft.squadron}, ${aircraft.group}, ${aircraft.station}.`}
        image="/images/archive/naming.jpg"
        imageAlt="The painted nose of Spirit of Martinez, 1945"
        imagePosition="top"
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <GraphicAccent
          name="ship"
          width={1500}
          height={503}
          className="mb-12 h-28 w-auto max-w-full sm:h-40"
        />
        <dl className="flex flex-wrap gap-px bg-rule">
          {aircraft.specs.map((s) => (
            <div
              key={s.label}
              className="min-w-[calc(50%-1px)] flex-1 bg-ink px-4 py-6 sm:min-w-[calc(33.333%-1px)]"
            >
              <dt className="text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                {s.label}
              </dt>
              <dd className="mt-2 font-display text-xl text-paper">{s.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
          The 95th Bomb Group database keeps an aircraft page for 44-6838 —
          fifty-three sorties under every pilot who sat left seat. It is a modern
          compilation, not a paper issued at Horham.{" "}
          <a
            href="https://95thbgdb.com/aircraft/314"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brass underline-offset-4 hover:text-paper hover:underline"
          >
            44-6838 — Spirit of Martinez
          </a>
          . The book tells the mornings she flew, and the ones she sat out, in{" "}
          <Link
            to="/chapters/$slug"
            params={{ slug: "borrowed-aircraft" }}
            className="text-brass underline-offset-4 hover:text-paper hover:underline"
          >
            Borrowed Aircraft
          </Link>
          .
        </p>

        <div className="mx-auto mt-16 max-w-4xl">
          <PhotoPlate id="nose" className="mt-0" />
          <PhotoPlate id="crusher" />
          <PhotoPlate id="spiritpage" />
          <PhotoPlate id="naming" />
          <PhotoPlate id="crew" />
          <PhotoPlate id="cockpit" />
          <PhotoPlate id="jacket" />
          <PhotoPlate id="noses" />
          <PhotoPlate id="belligerent" />
          <PhotoPlate id="spiritart" />
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {aircraft.facts.map((f) => (
            <article key={f.label}>
              <h2 className="font-display text-2xl text-paper">{f.label}</h2>
              <p className="mt-3 text-sm leading-relaxed text-fog">{f.body}</p>
            </article>
          ))}
        </div>

        <p className="mt-16 border-t border-rule pt-8 font-display text-xl text-fog italic">
          Fate: {aircraft.fate}. Last flight {aircraft.lastFlight}.
        </p>
        <GraphicAccent
          name="tally"
          width={1445}
          height={393}
          className="mt-12 h-24 w-auto max-w-full sm:mt-16 sm:h-36"
        />
      </div>
    </SiteShell>
  );
}
