import { chapterCues, collapseToParagraphs, type ReadingCue } from "./cues.ts";
import type { Chapter, Section } from "./types.ts";

export type SectionSeek = {
  id: string;
  title: string;
  start: number;
};

/** Same paragraph windows FOLLOW uses. Pass this chapter's cues — never all of them. */
export function paragraphCuesFor(slug: string, aligned?: ReadingCue[]) {
  if (aligned?.length) return collapseToParagraphs(aligned);
  return chapterCues[slug];
}

/** Cue id of a section's first paragraph — matches the chapter renderer. */
export function firstParagraphCueId(section: Section) {
  let pIndex = 0;
  for (const b of section.blocks) {
    if (b.type !== "p") continue;
    const positional = `${section.id}-p${pIndex}`;
    return b.id?.startsWith("m-") ? positional : (b.id ?? positional);
  }
  return undefined;
}

function startForSection(
  section: Section,
  byId: Map<string, { id: string; start: number }>,
) {
  const title = byId.get(`sec-${section.id}-title`);
  if (title) return title.start;
  const kicker = byId.get(`sec-${section.id}-id`);
  if (kicker) return kicker.start;
  const pid = firstParagraphCueId(section);
  if (!pid) return undefined;
  return byId.get(pid)?.start;
}

export function sectionSeeksFor(
  chapter: Chapter,
  aligned?: ReadingCue[],
): SectionSeek[] {
  if (!chapter.audio) return [];
  const cues = paragraphCuesFor(chapter.slug, aligned);
  if (!cues?.length) return [];
  const byId = new Map(cues.map((c) => [c.id, c]));
  const out: SectionSeek[] = [];
  for (const section of chapter.sections) {
    if (!section.title) continue;
    const start = startForSection(section, byId);
    if (start == null) continue;
    out.push({ id: section.id, title: section.title, start });
  }
  return out;
}
