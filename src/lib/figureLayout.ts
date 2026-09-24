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

/**
 * The one DOM id a figure gets on the chapter page, wherever it actually
 * lands — the full-plate wrapper when it's shown inline, or its
 * PassageDoor when shownInlineFigures thinned it to a door. A mission
 * figure keeps the "m-N" anchor other pages already link to
 * (missions.tsx, the mission-kicker, MissionMap); everything else gets a
 * plain "fig-<photoId>" id. Never both — the renderer picks exactly one
 * spot per figure to attach it.
 */
export function figureAnchorId(id: PhotoId, missionNumber?: number): string {
  return missionNumber != null ? `m-${missionNumber}` : `fig-${id}`;
}

export type FigureRailItem = {
  id: PhotoId;
  anchorId: string;
  missionNumber: number | undefined;
};

/**
 * Every figure in a chapter, in reading order across all sections —
 * including the ones shownInlineFigures thins to door-only from chapter
 * 10 on. This is the chapter plate rail's data: unlike the reading
 * itself, the rail always shows the full plate set, so it's the one
 * place a reader can see everything a dense chapter has to show.
 */
export function figureRail(
  sections: { blocks: Block[] }[],
  missionOf: (id: PhotoId) => number | undefined,
): FigureRailItem[] {
  const items: FigureRailItem[] = [];
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.type !== "figure") continue;
      const missionNumber = missionOf(block.id);
      items.push({ id: block.id, anchorId: figureAnchorId(block.id, missionNumber), missionNumber });
    }
  }
  return items;
}
