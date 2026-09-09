import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PhotoPlate } from "@/components/PhotoPlate";
import { adjacentCrew, crewById } from "@/data/crew";

export const Route = createFileRoute("/crew/$id")({
  component: CrewMemberPage,
  head: ({ params }) => {
    const member = crewById(params.id);
    if (!member) return {};
    return {
      meta: [
        { title: `${member.name} — The Spirit of Martinez` },
        {
          name: "description",
          content: `${member.role}. ${member.hometown}. ${member.wartime}`,
        },
      ],
    };
  },
});

function CrewMemberPage() {
  const { id } = Route.useParams();
  const member = crewById(id);
  if (!member) throw notFound();
  const { prev, next, index, total } = adjacentCrew(member.id);
  const citeUrl = `https://spiritofmartinez.com/crew/${member.id}`;

  return (
    <SiteShell>
      <article>
        <header className="border-b border-rule">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
            <Link
              to="/crew"
              className="inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-brass uppercase hover:text-paper"
            >
              Nine strangers
            </Link>
            <p className="mt-6 text-[0.68rem] tracking-[0.2em] text-brass uppercase">
              {String(index + 1).padStart(2, "0")} of {total} · {member.role}
            </p>
            <h1 className="mt-2 font-display text-4xl text-paper sm:text-5xl">
              {member.name}
            </h1>
            <p className="mt-2 text-sm tracking-[0.08em] text-muted uppercase">
              {member.hometown}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {member.photo ? (
            <PhotoPlate id={member.photo} className="mt-0" />
          ) : null}
          <p className="font-display text-lg leading-relaxed text-fog">
            {member.wartime}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted">{member.after}</p>

          <section className="mt-12 border-t border-rule pt-8">
            <h2 className="font-sans text-[0.68rem] tracking-[0.22em] text-brass uppercase">
              Cite this
            </h2>
            <p className="mt-3 font-display text-lg leading-relaxed text-fog">
              {member.name}, {member.role}. <em>The Spirit of Martinez</em>. {citeUrl}
            </p>
          </section>
        </div>

        <nav className="border-t border-rule bg-ink-soft">
          <div className="mx-auto grid max-w-3xl gap-0 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/crew/$id"
                params={{ id: prev.id }}
                className="flex min-h-24 flex-col justify-center gap-1 border-b border-rule px-6 py-6 sm:border-r sm:border-b-0"
              >
                <span className="flex items-center gap-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                  <ArrowLeft className="size-3.5" /> Previous
                </span>
                <span className="font-display text-xl text-paper">{prev.name}</span>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {next ? (
              <Link
                to="/crew/$id"
                params={{ id: next.id }}
                className="flex min-h-24 flex-col justify-center gap-1 px-6 py-6 text-right"
              >
                <span className="flex items-center justify-end gap-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                  Next <ArrowRight className="size-3.5" />
                </span>
                <span className="font-display text-xl text-paper">{next.name}</span>
              </Link>
            ) : null}
          </div>
        </nav>
      </article>
    </SiteShell>
  );
}
