import { followCues, type ReadingCue } from "../data/cues.ts";

export const SEEK_TAP_MS = 400;

/** Paragraph cue ids only. Headings (`sec-`, `ch-`) and sentence ids are not targets. */
export function isParagraphCue(id: string): boolean {
  return /^.+-p\d+$/.test(id);
}

export type SeekTap = { id: string; at: number };

export function registerSeekTap(
  prev: SeekTap | null,
  id: string,
  at: number,
): { seek: boolean; next: SeekTap | null } {
  if (!isParagraphCue(id)) return { seek: false, next: prev };
  if (prev && prev.id === id && at > prev.at && at - prev.at <= SEEK_TAP_MS) {
    return { seek: true, next: null };
  }
  return { seek: false, next: { id, at } };
}

/** Cue start for each paragraph the reading actually speaks. */
export function seekStarts(cues: ReadingCue[], silent: string[] = []): Map<string, number> {
  const map = new Map<string, number>();
  for (const cue of followCues(cues, silent)) {
    if (!isParagraphCue(cue.id) || cue.end <= cue.start) continue;
    map.set(cue.id, cue.start);
  }
  return map;
}
