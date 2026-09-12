import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PhotoPlate } from "@/components/PhotoPlate";
import { adjacentPhotos, citePhoto, isPhotoId, photos } from "@/data/photos";

export const Route = createFileRoute("/archive/$id")({
  component: ArchiveObjectPage,
  head: ({ params }) => {
    const photo = isPhotoId(params.id) ? photos[params.id] : undefined;
    if (!photo) return {};
    const cite = citePhoto(photo);
    return {
      meta: [
        { title: `${photo.title} — The Spirit of Martinez` },
        { name: "description", content: photo.caption },
        { name: "citation", content: `${cite.credit}. ${cite.title}${cite.dated}. ${cite.work}. ${cite.url}` },
      ],
    };
  },
});

function ArchiveObjectPage() {
  const { id } = Route.useParams();
  if (!isPhotoId(id)) throw notFound();
  const photo = photos[id];
  const { prev, next, index, total } = adjacentPhotos(id);
  const kind = photo.kind === "photograph" ? "Photograph" : "Object";
  const cite = citePhoto(photo);

  return (
    <SiteShell>
      <article className="bg-paper text-ink">
        <header className="border-b border-paper-deep">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
            <Link
              to="/archive"
              className="inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-feather uppercase hover:text-ink"
            >
              The footlocker
            </Link>
            <p className="mt-6 font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase">
              {kind} · {String(index + 1).padStart(2, "0")} of {total}
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
              {photo.title}
            </h1>
            {photo.date ? (
              <p className="mt-3 font-sans text-sm tracking-wide text-ink-soft">
                {photo.date}
              </p>
            ) : null}
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <PhotoPlate id={photo.id} tone="paper" className="mt-0" />

          <section className="mt-12 border-t border-paper-deep pt-8">
            <h2 className="font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase">
              What is visible
            </h2>
            <p className="mt-3 font-display text-xl leading-relaxed text-ink">
              {photo.alt}
            </p>
          </section>

          {photo.source ? (
            <section className="mt-10 border-t border-paper-deep pt-8">
              <h2 className="font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase">
                In the record
              </h2>
              <a
                href={photo.source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center font-sans text-[0.68rem] tracking-[0.16em] text-brass-dim uppercase hover:text-ink"
              >
                {photo.source.label}
              </a>
            </section>
          ) : null}

          <section className="mt-10 border-t border-paper-deep pt-8">
            <h2 className="font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase">
              Cite this
            </h2>
            <p className="mt-3 font-display text-lg leading-relaxed text-ink-soft">
              {cite.credit}. <em>{cite.title}</em>
              {cite.dated}. {cite.work}. {cite.url}
            </p>
          </section>
        </div>

        <nav className="border-t border-rule bg-ink-soft text-paper">
          <div className="mx-auto grid max-w-3xl gap-0 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/archive/$id"
                params={{ id: prev.id }}
                className="flex min-h-24 flex-col justify-center gap-1 border-b border-rule px-6 py-6 sm:border-r sm:border-b-0"
              >
                <span className="flex items-center gap-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                  <ArrowLeft className="size-3.5" /> Previous
                </span>
                <span className="font-display text-xl text-paper">{prev.title}</span>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {next ? (
              <Link
                to="/archive/$id"
                params={{ id: next.id }}
                className="flex min-h-24 flex-col justify-center gap-1 px-6 py-6 text-right"
              >
                <span className="flex items-center justify-end gap-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                  Next <ArrowRight className="size-3.5" />
                </span>
                <span className="font-display text-xl text-paper">{next.title}</span>
              </Link>
            ) : null}
          </div>
        </nav>
      </article>
    </SiteShell>
  );
}