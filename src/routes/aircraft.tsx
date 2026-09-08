import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/PageHero";
import { PhotoPlate } from "@/components/PhotoPlate";
import { aircraft } from "@/data/aircraft";

export const Route = createFileRoute("/aircraft")({ component: AircraftPage });

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
        <dl className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-3">
          {aircraft.specs.map((s) => (
            <div key={s.label} className="bg-ink px-4 py-6">
              <dt className="text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                {s.label}
              </dt>
              <dd className="mt-2 font-display text-xl text-paper">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mx-auto mt-16 max-w-4xl">
          <PhotoPlate id="nose" className="mt-0" />
          <PhotoPlate id="naming" />
          <PhotoPlate id="crew" />
          <PhotoPlate id="jacket" />
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
      </div>
    </SiteShell>
  );
}
