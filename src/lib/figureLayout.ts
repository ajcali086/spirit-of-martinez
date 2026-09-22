import type { Block, PhotoId } from "../data/types.ts";

/**
 * Consecutive figures hanging off one paragraph.
 * A second clipping in the same run stays a door, not a second full plate.
 */
export function figureRuns(blocks: Block[]): PhotoId[][] {
  const runs: PhotoId[][] = [];
  let cur: PhotoId[] = [];
  for (const b of blocks) {
    if (b.type === "figure") {
      cur.push(b.id);
      continue;
    }
    if (cur.length) {
      runs.push(cur);
      cur = [];
    }
  }
  if (cur.length) runs.push(cur);
  return runs;
}

/** One plate in the reading per run. Prefer a photograph; papers and docs yield. */
export function inlineFigureIds(
  blocks: Block[],
  kindOf: (id: PhotoId) => "photograph" | "object",
): Set<PhotoId> {
  const keep = new Set<PhotoId>();
  for (const run of figureRuns(blocks)) {
    const photo = run.find((id) => kindOf(id) === "photograph");
    keep.add(photo ?? run[0]);
  }
  return keep;
}

/**
 * Chapters 10 and later: one full plate per stack. Earlier chapters keep every plate.
 * `undefined` means the renderer should not hide any figure.
 */
export function shownInlineFigures(
  chapterNumber: number,
  blocks: Block[],
  kindOf: (id: PhotoId) => "photograph" | "object",
): Set<PhotoId> | undefined {
  if (chapterNumber < 10) return undefined;
  return inlineFigureIds(blocks, kindOf);
}
