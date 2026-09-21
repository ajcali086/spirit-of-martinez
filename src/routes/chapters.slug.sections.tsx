import type { Chapter, PhotoId } from "@/data/types";
import type { SectionSeek } from "@/data/sectionSeeks";
import type { ChapterTrack } from "@/components/layout/BookAudio";
import { cn } from "@/lib/utils";
import { seekButton, renderBlock } from "./chapters.slug.helpers";

type Props = {
  chapter: Chapter;
  activeId: string | null;
  seeks: SectionSeek[] | undefined;
  playFrom: (track: ChapterTrack, seconds: number) => void;
};

export function ChapterSections({
  chapter,
  activeId,
  seeks,
  playFrom,
}: Props) {
  let firstPara = true;
  return (
    <>
            {chapter.sections.map((section) => {
              let pIndex = 0;
              const plateDoors = new Map<string, PhotoId[]>();
              let lastP: string | undefined;
              for (const b of section.blocks) {
                if (b.type === "p" && b.id) lastP = b.id;
                if (b.type === "figure" && lastP) {
                  const list = plateDoors.get(lastP) ?? [];
                  list.push(b.id);
                  plateDoors.set(lastP, list);
                }
              }
              return (
              <section
                key={section.id}
                id={section.id}
                className="mb-14 scroll-mt-28"
              >
                {section.title ? (
                  <header className="mb-6">
                    <p
                      data-cue={`sec-${section.id}-id`}
                      className={cn(
                        "font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase",
                        activeId === `sec-${section.id}-id` && "is-reading",
                      )}
                    >
                      {section.id}
                    </p>
                    <h2
                      data-cue={`sec-${section.id}-title`}
                      className={cn(
                        "mt-2 font-display text-3xl text-ink",
                        activeId === `sec-${section.id}-title` && "is-reading",
                      )}
                    >
                      {seekButton(chapter, section, seeks, playFrom)}
                    </h2>
                    {section.place ? (
                      <p
                        data-cue={`sec-${section.id}-place`}
                        className={cn(
                          "mt-1 font-display text-base text-muted italic",
                          activeId === `sec-${section.id}-place` && "is-reading",
                        )}
                      >
                        {section.place}
                      </p>
                    ) : null}
                  </header>
                ) : null}
                {section.blocks.map((block, i) => {
                  let cueId: string | undefined;
                  if (block.type === "p") {
                    const positional = `${section.id}-p${pIndex++}`;
                    cueId = block.id?.startsWith("m-") ? positional : (block.id ?? positional);
                  }
                  const node = renderBlock(
                    block,
                    firstPara && block.type === "p",
                    cueId,
                    activeId,
                    block.type === "p" && block.id
                      ? plateDoors.get(block.id)
                      : undefined,
                  );
                  if (firstPara && block.type === "p") firstPara = false;
                  return <div key={`${section.id}-${i}`}>{node}</div>;
                })}
              </section>
              );
            })}
    </>
  );
}
