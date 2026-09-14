export type ReadingCue = { id: string; start: number; end: number };

/** Sentence-scale is the goal; Chapter 1 ships paragraph cues timed from the reading. */
export const chapterCues: Record<string, ReadingCue[]> = {
  "weight-of-small-machines": [
    { id: "1.1-p0", start: 16.29, end: 40.6 },
    { id: "1.1-p1", start: 40.6, end: 48.54 },
    { id: "1.1-p2", start: 48.54, end: 80.35 },
    { id: "1.1-p3", start: 80.35, end: 84.82 },
    { id: "1.1-p4", start: 84.82, end: 109.56 },
    { id: "1.1-p5", start: 109.56, end: 114.09 },
    { id: "1.1-p6", start: 114.09, end: 134.12 },
    { id: "1.1-p7", start: 134.12, end: 156.32 },
    { id: "1.1-p8", start: 156.32, end: 166.61 },
    { id: "1.1-p9", start: 166.61, end: 182.49 },
    { id: "1.1-p10", start: 182.49, end: 201.03 },
    { id: "1.1-p11", start: 201.03, end: 205.37 },
    { id: "1.2-p0", start: 212.31, end: 218.59 },
    { id: "1.2-p1", start: 218.59, end: 245.46 },
    { id: "1.2-p2", start: 245.46, end: 264.17 },
    { id: "1.2-p3", start: 264.17, end: 288.11 },
    { id: "1.2-p4", start: 288.11, end: 307.58 },
    { id: "1.2-p5", start: 307.58, end: 342.03 },
    { id: "1.2-p6", start: 342.03, end: 366.59 },
    { id: "1.2-p7", start: 366.59, end: 400.3 },
    { id: "1.2-p8", start: 400.3, end: 435.62 },
    { id: "1.2-p9", start: 435.62, end: 482.2 },
    { id: "1.2-p10", start: 482.2, end: 507.76 },
    { id: "1.2-p11", start: 507.76, end: 518.64 },
    { id: "1.2-p12", start: 518.64, end: 549.3 },
    { id: "1.2-p13", start: 549.3, end: 579.7 },
    { id: "1.2-p14", start: 579.7, end: 600.97 },
    { id: "1.2-p15", start: 600.97, end: 612.29 },
  ],
};

export function cueAt(cues: ReadingCue[], time: number) {
  if (cues.length === 0 || time < cues[0].start) return null;
  for (const cue of cues) {
    if (time >= cue.start && time < cue.end) return cue;
  }
  return cues[cues.length - 1];
}
