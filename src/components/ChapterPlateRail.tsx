import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { photos } from "@/data/photos";
import type { FigureRailItem } from "@/lib/figureLayout";
import { webpSrcSet } from "@/lib/srcset";
import { cn } from "@/lib/utils";

/**
 * A collapsible strip under the chapter hero listing every plate in the
 * chapter, in reading order — including the ones figureLayout.ts thins to
 * door-only from chapter 10 on (see the moment-sharing spec's sibling,
 * chapter-plate-rail-spec.md, for why: this is the one place a dense
 * chapter's full plate set is visible together). Sections stay out;
 * missions ride along as numbered ticks on their thumbnail.
 *
 * Tapping a thumbnail jumps to the figure's one DOM id, wherever it
 * actually landed (figureAnchorId / figureLayout.figureRail) — a plain
 * scrollIntoView, not a route change, so it works the same whether that
 * figure rendered as a full plate or as a door.
 */
export function ChapterPlateRail({
  items,
  chapterSlug,
}: {
  items: FigureRailItem[];
  chapterSlug: string;
}) {
  const [open, setOpen] = useState(false);

  // "Collapsed state resets between chapters" — this component doesn't
  // remount on a slug change (same route), so reset explicitly.
  useEffect(() => {
    setOpen(false);
  }, [chapterSlug]);

  if (!items.length) return null;

  return (
    <div className="border-b border-rule bg-paper-deep/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between px-4 py-3 font-sans text-[0.68rem] tracking-[0.18em] text-muted uppercase hover:text-ink sm:px-6"
      >
        <span>
          In this chapter · {items.length} plate{items.length === 1 ? "" : "s"}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform duration-150", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          role="list"
          aria-label="Plates in this chapter"
          className="flex items-start gap-3 overflow-x-auto px-4 pb-4 sm:px-6"
        >
          {items.map((item) => {
            const photo = photos[item.id];
            const label =
              item.missionNumber != null
                ? `Mission ${item.missionNumber}: ${photo.title}. Jump to plate.`
                : `${photo.title}. Jump to plate.`;
            return (
              <button
                key={item.id}
                type="button"
                role="listitem"
                onClick={() =>
                  document
                    .getElementById(item.anchorId)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                aria-label={label}
                className="group relative block w-20 shrink-0 overflow-hidden bg-ink-mid outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              >
                <img
                  src={`${photo.src}.jpg`}
                  srcSet={webpSrcSet(photo.src)}
                  sizes="80px"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-opacity duration-150 group-hover:opacity-80"
                />
                {item.missionNumber != null ? (
                  <span
                    aria-hidden
                    className="absolute top-1 left-1 flex size-5 items-center justify-center bg-ink/80 font-sans text-[0.6rem] tracking-wide text-paper"
                  >
                    {item.missionNumber}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
