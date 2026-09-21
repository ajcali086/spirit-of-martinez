import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteImage } from "@/components/SiteImage";
import { SIZES } from "@/lib/srcset";
import { readPlace } from "@/lib/bookmark";
import {
  dismissContinue,
  displayContinue,
  type ResolvedContinue,
} from "@/lib/continue";

export function ContinueCard() {
  const [place, setPlace] = useState<ResolvedContinue | null>(null);

  useEffect(() => {
    setPlace(displayContinue(readPlace()));
  }, []);

  if (!place) return null;

  function onDismiss() {
    dismissContinue();
    setPlace(null);
  }

  const resume =
    place.kind === "chapter" ? (
      <Link
        to="/chapters/$slug"
        params={{ slug: place.slug }}
        hash={place.hash || undefined}
        className="mt-3 inline-flex min-h-11 items-center text-[0.7rem] tracking-[0.14em] text-brass uppercase hover:text-paper"
      >
        Resume reading
        <span aria-hidden="true">&nbsp;→</span>
      </Link>
    ) : (
      <Link
        to="/archive/$id"
        params={{ id: place.slug }}
        className="mt-3 inline-flex min-h-11 items-center text-[0.7rem] tracking-[0.14em] text-brass uppercase hover:text-paper"
      >
        Resume reading
        <span aria-hidden="true">&nbsp;→</span>
      </Link>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <article
        aria-label="Continue reading"
        className="relative flex gap-4 border border-rule bg-ink-soft p-3 sm:p-4"
      >
        <SiteImage
          src={place.image}
          alt={place.title}
          width={96}
          height={96}
          loading="lazy"
          sizes={SIZES.continueThumb}
          className="size-24 shrink-0 bg-ink-mid object-cover"
        />
        <div className="min-w-0 flex-1 pr-10">
          <p className="kicker">Continue</p>
          <p className="mt-1 font-display text-xl leading-tight text-paper sm:text-2xl">
            {place.title}
          </p>
          {place.section ? (
            <p className="mt-1 text-sm leading-snug text-muted">{place.section}</p>
          ) : null}
          {place.preview ? (
            <p className="mt-2 truncate text-sm text-fog">{place.preview}</p>
          ) : null}
          {resume}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss continue card"
          className="absolute top-1 right-1 flex size-11 items-center justify-center text-muted hover:text-paper"
        >
          <X className="size-4" aria-hidden />
        </button>
      </article>
    </div>
  );
}
