import { Link } from "@tanstack/react-router";
import { photos, plateNumber } from "@/data/photos";
import type { PhotoId } from "@/data/types";
import { cn } from "@/lib/utils";
import { webpSrcSet } from "@/lib/srcset";

export function PassageDoor({
  id,
  open,
  anchor,
}: {
  id: PhotoId;
  open: boolean;
  /** Mission hash when this plate is a door only, not an inline figure. */
  anchor?: string;
}) {
  const photo = photos[id];
  const n = String(plateNumber(id)).padStart(2, "0");

  return (
    <Link
      id={anchor}
      data-passage-door
      to="/archive/$id"
      params={{ id }}
      aria-label={`Plate ${n}: ${photo.title}`}
      className={cn(
        "mt-2 flex min-h-11 items-center gap-3 font-sans text-[0.68rem] tracking-[0.16em] text-feather/55 uppercase transition-colors duration-150 hover:text-feather focus-visible:text-feather focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass xl:absolute xl:top-0 xl:left-full xl:mt-0 xl:ml-8 xl:w-28 xl:flex-col xl:items-start xl:gap-2",
        open && "text-feather",
        anchor && "scroll-mt-28",
      )}
    >
      <span className="xl:hidden">See the plate</span>
      <span className="hidden xl:inline">Plate {n}</span>
      <span
        className={cn(
          "w-16 overflow-hidden bg-ink-mid transition-opacity duration-150 xl:w-24",
          open
            ? "block opacity-100"
            : "hidden xl:block xl:opacity-0 xl:group-hover:opacity-100 xl:group-focus-within:opacity-100",
        )}
        aria-hidden
      >
        <img
          src={`${photo.src}.jpg`}
          alt=""
          width={96}
          height={Math.max(1, Math.round((96 * photo.height) / photo.width))}
          loading="lazy"
          decoding="async"
          srcSet={webpSrcSet(photo.src)}
          sizes="96px"
          className="block w-full"
        />
      </span>
    </Link>
  );
}
