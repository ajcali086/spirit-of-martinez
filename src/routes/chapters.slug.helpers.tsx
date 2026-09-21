import { Play } from "lucide-react";
import { PhotoPlate } from "@/components/PhotoPlate";
import { PassageDoor } from "@/components/PassageDoor";
import { useBookAudio, type ChapterTrack } from "@/components/layout/BookAudio";
import type { Block, Chapter, PhotoId, Section } from "@/data/types";
import { sectionSeeks, type SectionSeek } from "@/data/sectionSeeks";
import { cn } from "@/lib/utils";


export function seekButton(
  chapter: Chapter,
  section: Section,
  seeks: SectionSeek[] | undefined,
  playFrom: (track: ChapterTrack, seconds: number) => void,
) {
  const seek = seeks?.find((s) => s.id === section.id);
  if (!seek || !chapter.audio) return section.title;
  return (
    <button
      type="button"
      className="seek"
      data-seek={String(seek.start)}
      aria-label={`Play reading from ${section.id}, ${section.title}`}
      onClick={() =>
        playFrom(
          {
            kind: "chapter",
            src: chapter.audio!,
            title: chapter.title,
            number: chapter.number,
            slug: chapter.slug,
          },
          seek.start,
        )
      }
    >
      <span>{section.title}</span>
      <Play className="seek-glyph" aria-hidden strokeWidth={1.75} />
    </button>
  );
}

export function renderBlock(
  block: Block,
  dropCap: boolean,
  cueId?: string,
  activeId?: string | null,
  plates?: PhotoId[],
) {
  if (block.type === "quote") {
    return (
      <blockquote className="quote-pull">
        {block.text}
        {block.cite ? (
          <footer className="mt-2 font-sans text-[0.68rem] tracking-[0.14em] text-muted not-italic uppercase">
            {block.cite}
          </footer>
        ) : null}
      </blockquote>
    );
  }
  if (block.type === "note") {
    return (
      <aside className="my-6 border border-brass/30 bg-paper-deep px-4 py-3 font-sans text-sm leading-relaxed text-ink-soft">
        {block.text}
      </aside>
    );
  }
  if (block.type === "artifact") {
    return (
      <aside className="my-6 border-l-2 border-feather bg-paper-deep/70 px-4 py-3">
        <p className="font-sans text-[0.68rem] tracking-[0.18em] text-feather uppercase">
          {block.title}
        </p>
        <p className="mt-1 font-display text-lg text-ink">{block.body}</p>
      </aside>
    );
  }
  if (block.type === "figure") {
    return <PhotoPlate id={block.id} caption={block.caption} tone="paper" />;
  }
  const reading = Boolean(cueId && activeId === cueId);
  const missionNo = block.id?.match(/^m-(\d+)$/)?.[1];
  const paragraph = (
    <p
      id={block.id}
      data-cue={cueId}
      className={cn(
        dropCap && "drop-cap",
        block.id && "scroll-mt-28",
        cueId && "scroll-mt-28",
        reading && "is-reading",
      )}
    >
      {missionNo ? (
        <>
          <span className="mr-3 font-display text-[1.05rem] text-feather tabular-nums">
            {missionNo.padStart(2, "0")}
          </span>{" "}
        </>
      ) : null}
      {block.text}
    </p>
  );
  if (!plates?.length) return paragraph;
  return (
    <div className="group relative">
      {paragraph}
      {plates.map((id) => (
        <PassageDoor key={id} id={id} open={reading} />
      ))}
    </div>
  );
}
