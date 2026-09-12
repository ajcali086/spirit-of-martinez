import { useRef, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { photos, type ArchivePhoto } from "@/data/photos";
import type { PhotoId } from "@/data/types";
import { cn } from "@/lib/utils";

export function PhotoPlate({
  id,
  caption,
  tone = "ink",
  priority = false,
  constrain = true,
  className,
}: {
  id: PhotoId;
  caption?: string;
  tone?: "ink" | "paper";
  priority?: boolean;
  constrain?: boolean;
  className?: string;
}) {
  const photo = photos[id];
  const text = caption ?? photo.caption;
  const portrait = photo.height > photo.width;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onCard = pathname === `/archive/${id}`;
  const widthClass = onCard
    ? "w-full"
    : photo.maxWidth === "sm"
      ? "mx-auto w-full max-w-sm"
      : photo.maxWidth === "lg"
        ? "mx-auto w-full max-w-lg"
        : photo.maxWidth === "xl"
          ? "w-full"
          : constrain && portrait
            ? "mx-auto w-full max-w-lg"
            : undefined;

  const image = (
    <picture>
      <source srcSet={`${photo.src}.webp`} type="image/webp" />
      <img
        src={`${photo.src}.jpg`}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        sizes={
          onCard
            ? "(min-width: 768px) 48rem, 100vw"
            : photo.maxWidth === "sm"
              ? "(min-width: 640px) 24rem, 100vw"
              : photo.maxWidth === "xl"
                ? "(min-width: 1024px) 56rem, 100vw"
                : widthClass
                  ? "(min-width: 640px) 32rem, 100vw"
                  : "(min-width: 1024px) 56rem, 100vw"
        }
        className="h-auto w-full bg-ink-mid"
      />
    </picture>
  );

  return (
    <figure className={cn("my-8", widthClass, className)}>
      {onCard ? (
        <PlateZoom photo={photo}>{image}</PlateZoom>
      ) : (
        <Link
          to="/archive/$id"
          params={{ id }}
          aria-label={`${photo.title}. Open the plate.`}
          className="block outline-none transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
        >
          {image}
        </Link>
      )}
      <figcaption
        className={cn(
          "mt-3 font-sans text-sm leading-relaxed",
          tone === "paper" ? "text-ink-soft/80" : "text-muted",
        )}
      >
        {text}
        <span
          className={cn(
            "relative z-10 mt-1 block text-xs tracking-widest uppercase",
            tone === "paper" ? "text-brass-dim" : "text-brass",
          )}
        >
          {photo.credit}
          {photo.source ? (
            <>
              {" · "}
              <a
                href={photo.source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center tracking-[0.16em] underline-offset-4 hover:underline"
              >
                {photo.source.label}
              </a>
            </>
          ) : null}
          {onCard ? (
            <>
              {" · "}
              Zoom to read the hand
            </>
          ) : (
            <>
              {" · "}
              <Link
                to="/archive/$id"
                params={{ id }}
                className="tracking-[0.16em] underline-offset-4 hover:underline"
              >
                Open the plate
              </Link>
            </>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

function PlateZoom({
  photo,
  children,
}: {
  photo: ArchivePhoto;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Zoom. ${photo.title}.`}
        className="block w-full cursor-zoom-in outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
      >
        {children}
      </button>
      <dialog
        ref={dialog}
        aria-label={photo.title}
        className="m-0 h-full max-h-none w-full max-w-none bg-ink p-0 text-paper open:flex open:flex-col [&::backdrop]:bg-ink/95"
      >
        <form
          method="dialog"
          className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-rule bg-ink/90 px-4 py-3"
        >
          <p className="truncate font-sans text-[0.68rem] tracking-[0.16em] text-brass uppercase">
            {photo.title}
          </p>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-paper uppercase hover:text-brass"
          >
            Close
          </button>
        </form>
        <div className="min-h-0 flex-1 overflow-auto">
          <img
            src={`${photo.src}.jpg`}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className="mx-auto block h-auto max-w-none bg-ink-mid"
            style={{ width: photo.width }}
          />
        </div>
      </dialog>
    </>
  );
}
