import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { SpiritMark } from "@/components/SpiritMark";
import { PhotoPlate } from "@/components/PhotoPlate";
import { chapters } from "@/data/chapters";
import { crew } from "@/data/crew";
import { missions } from "@/data/missions";
import { timelineEras } from "@/data/timeline";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const stats = [
  { value: "28", label: "Combat missions" },
  { value: "3", label: "Food drops" },
  { value: "208", label: "Combat hours" },
  { value: "9", label: "Men in the crew" },
];

function Home() {
  const featured = [chapters[0], chapters[8], chapters[10], chapters[14]];

  return (
    <SiteShell>
      <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-end overflow-hidden">
        <img
          src="/images/hero-fortress.jpg"
          alt="The locker arranged: B-15 jacket, Horham crew photograph, wallet, and gloves"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-ink/25" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-12 sm:px-6 sm:pb-24">
          <p className="kicker stagger-in">Martinez, California · 1938–1959</p>
          <h1 className="stagger-in mt-4 max-w-4xl font-display text-4xl leading-[0.95] font-semibold text-paper sm:text-6xl lg:text-7xl">
            The Spirit of Martinez
          </h1>
          <p className="stagger-in mt-3 font-display text-xl italic text-fog sm:text-2xl">
            What a Family Kept
          </p>
          <div className="stagger-in mt-6 flex flex-wrap gap-3">
            <Link
              to="/chapters"
              className="inline-flex min-h-12 items-center gap-2 bg-brass px-5 text-sm tracking-[0.12em] text-ink uppercase transition-transform duration-150 ease-out hover:bg-brass-dim active:scale-[0.96]"
            >
              Read the book
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/missions"
              className="inline-flex min-h-12 items-center border border-fog/40 px-5 text-sm tracking-[0.12em] text-paper uppercase transition-colors hover:border-brass hover:text-brass"
            >
              Mission board
            </Link>
          </div>
          <p className="stagger-in mt-6 max-w-xl text-sm leading-relaxed text-fog">
            A butcher’s son from a refinery town. A B-17 named for the city that
            taught him to fly. Twenty-eight mornings over Germany, three over
            Utrecht with flour in the bomb bay, and a footlocker that never
            agreed with itself about the count.
          </p>
        </div>
      </section>

      <section className="border-b border-rule bg-ink-soft">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-rule sm:grid-cols-4 sm:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-8 text-center sm:py-10">
              <p className="font-display text-4xl text-brass sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-[0.68rem] tracking-[0.18em] text-muted uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="era-rail-heading" className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex items-baseline justify-between gap-4">
            <p id="era-rail-heading" className="kicker">
              1902–1959
            </p>
            <Link
              to="/timeline"
              className="min-h-11 inline-flex items-center text-[0.72rem] tracking-[0.16em] text-brass uppercase"
            >
              Full chronology
            </Link>
          </div>
          <ol className="mt-8 grid gap-px border-t border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {timelineEras.map((era) => (
              <li key={era.id} className="bg-ink">
                <Link
                  to="/timeline"
                  hash={era.id}
                  className="group flex min-h-28 flex-col px-4 py-6 transition-colors hover:bg-ink-soft sm:min-h-32 sm:px-5"
                >
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-brass" aria-hidden />
                    <span className="text-[0.68rem] tracking-[0.18em] text-brass uppercase">
                      {era.label}
                    </span>
                  </span>
                  <span className="mt-3 font-display text-2xl leading-none text-paper group-hover:text-brass">
                    {era.span}
                  </span>
                  <span className="mt-3 text-sm leading-relaxed text-muted">
                    {era.line}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="kicker">A family archive</p>
        <h2 className="mt-4 font-display text-3xl text-paper sm:text-4xl">
          The family kept the objects. The institutions kept the numbers. They do not always agree.
        </h2>
        <div className="mt-8 space-y-5 font-display text-lg leading-relaxed text-fog">
          <p>
            Frank Calicura learned to fly on a strip of dragged fill his eldest
            brother built beside the Southern Pacific tracks, four blocks from
            the house of seventeen children. The Army scored him a pilot on a
            stanine, not a logbook. In the last winter of the European war he
            took a Fortress named for Martinez over Chemnitz, Swinemünde,
            Hamburg, and Kiel — and then, with the same bomb bay, over a Dutch
            field marked with bedsheets.
          </p>
          <p>
            This site is the book that came out of the footlocker: certificates,
            a cartoon woodpecker, nine wallets stamped for the Pacific, a jacket
            with one bomb too many, and a scrapbook Joyce numbered in pencil
            after he came home.
          </p>
        </div>
      </section>

      <section className="border-y border-rule bg-ink-soft py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="kicker">Horham, 1945</p>
          <h2 className="mt-3 font-display text-3xl text-paper sm:text-4xl">
            The crew, under the name
          </h2>
          <PhotoPlate id="crew" className="mt-8 mb-0" />
        </div>
      </section>

      <section className="border-t border-rule bg-ink py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker">Fifteen chapters</p>
              <h2 className="mt-3 font-display text-3xl text-paper sm:text-4xl">
                Begin anywhere
              </h2>
            </div>
            <Link
              to="/chapters"
              className="hidden min-h-11 items-center text-[0.72rem] tracking-[0.16em] text-brass uppercase sm:inline-flex"
            >
              Full contents
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featured.map((ch) => (
              <Link
                key={ch.slug}
                to="/chapters/$slug"
                params={{ slug: ch.slug }}
                className="group overflow-hidden bg-ink-soft transition-transform duration-150 ease-out hover:-translate-y-0.5"
              >
                <div className="aspect-16/9 overflow-hidden">
                  <img
                    src={ch.image}
                    alt={ch.imageAlt}
                    className={cn(
                      "size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
                      ch.imagePosition === "top" && "object-top",
                    )}
                  />
                </div>
                <div className="p-5">
                  <p className="text-[0.68rem] tracking-[0.2em] text-brass uppercase">
                    Chapter {String(ch.number).padStart(2, "0")} · {ch.years}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-paper group-hover:text-brass">
                    {ch.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                    {ch.dek}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="kicker">Crew no. 8</p>
        <h2 className="mt-3 font-display text-3xl text-paper sm:text-4xl">
          Nine names on the same paper
        </h2>
        <ul className="mt-8 divide-y divide-rule border-y border-rule">
          {crew.map((m) => (
            <li key={m.id}>
              <Link
                to="/crew"
                className="flex min-h-14 flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="font-display text-xl text-paper">{m.name}</span>
                <span className="text-[0.72rem] tracking-[0.14em] text-muted uppercase">
                  {m.role} · {m.hometown}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative overflow-hidden border-t border-rule">
        <img
          src="/images/archive/utrechtapproach.jpg"
          alt="Approach to the Utrecht drop zone, May 3, 1945: a mill on a canal, fields beyond"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <SpiritMark className="mx-auto size-14" />
          <p className="mt-6 font-display text-2xl leading-snug text-paper italic sm:text-3xl">
            “We should be the honored ones, in having the people at home asking
            us to name it after our town.”
          </p>
          <p className="mt-4 text-[0.7rem] tracking-[0.18em] text-brass uppercase">
            Frank Calicura to Ray Taylor · April 1945
          </p>
          <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-fog">
            {missions.filter((m) => m.kind === "humanitarian").length} mornings
            over Utrecht at the end of a tour that began at Chemnitz. The
            wallets had been stamped for the Pacific. The war these nine men
            had been fighting did not relocate.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
