export type ReadingCue = { id: string; start: number; end: number };

/** Paragraph windows timed from each chapter's reading. Sentences split at render. */
export const chapterCues: Record<string, ReadingCue[]> = {
  "weight-of-small-machines": [
    { id: "1.1-p0", start: 8.53, end: 33.26 },
    { id: "1.1-p1", start: 33.26, end: 41.34 },
    { id: "1.1-p2", start: 41.34, end: 73.71 },
    { id: "1.1-p3", start: 73.71, end: 78.26 },
    { id: "1.1-p4", start: 78.26, end: 103.43 },
    { id: "1.1-p5", start: 103.43, end: 108.04 },
    { id: "1.1-p6", start: 108.04, end: 128.42 },
    { id: "1.1-p7", start: 128.42, end: 151.01 },
    { id: "1.1-p8", start: 151.01, end: 161.49 },
    { id: "1.1-p9", start: 161.49, end: 177.64 },
    { id: "1.1-p10", start: 177.64, end: 196.51 },
    { id: "1.1-p11", start: 196.51, end: 200.92 },
    { id: "1.2-p0", start: 206.42, end: 212.8 },
    { id: "1.2-p1", start: 212.8, end: 240.06 },
    { id: "1.2-p2", start: 240.06, end: 259.05 },
    { id: "1.2-p3", start: 259.05, end: 283.34 },
    { id: "1.2-p4", start: 283.34, end: 303.09 },
    { id: "1.2-p5", start: 303.09, end: 338.05 },
    { id: "1.2-p6", start: 338.05, end: 362.98 },
    { id: "1.2-p7", start: 362.98, end: 397.18 },
    { id: "1.2-p8", start: 397.18, end: 433.02 },
    { id: "1.2-p9", start: 433.02, end: 480.28 },
    { id: "1.2-p10", start: 480.28, end: 506.22 },
    { id: "1.2-p11", start: 506.22, end: 517.26 },
    { id: "1.2-p12", start: 517.26, end: 548.37 },
    { id: "1.2-p13", start: 548.37, end: 579.23 },
    { id: "1.2-p14", start: 579.23, end: 600.81 },
    { id: "1.2-p15", start: 600.81, end: 612.29 },
  ],
  "the-strip-by-the-tracks": [
    { id: "2.1-p0", start: 8.85, end: 48.46 },
    { id: "2.1-p1", start: 48.46, end: 68.68 },
    { id: "2.1-p2", start: 68.68, end: 91.32 },
    { id: "2.1-p3", start: 91.32, end: 114.88 },
    { id: "2.1-p4", start: 114.88, end: 128.86 },
    { id: "2.1-p5", start: 128.86, end: 149.48 },
    { id: "2.1-p6", start: 149.48, end: 166.11 },
    { id: "2.1-p7", start: 166.11, end: 176.74 },
    { id: "2.1-p8", start: 176.74, end: 214.39 },
    { id: "2.1-p9", start: 214.39, end: 251.01 },
    { id: "2.1-p10", start: 251.01, end: 270.35 },
    { id: "2.1-p11", start: 270.35, end: 288.2 },
    { id: "2.1-p12", start: 288.2, end: 310.26 },
    { id: "2.1-p13", start: 310.26, end: 360.68 },
    { id: "2.1-p14", start: 360.68, end: 403.3 },
    { id: "2.1-p15", start: 403.3, end: 424.5 },
    { id: "2.1-p16", start: 424.5, end: 449.16 },
    { id: "2.1-p17", start: 449.16, end: 468.74 },
    { id: "2.1-p18", start: 468.74, end: 475.44 },
    { id: "2.1-p19", start: 475.44, end: 496.34 },
    { id: "2.1-p20", start: 496.34, end: 499.46 },
    { id: "2.1-p21", start: 499.46, end: 508.41 },
    { id: "2.2-p0", start: 513.91, end: 527.37 },
    { id: "2.2-p1", start: 527.37, end: 538.11 },
    { id: "2.2-p2", start: 538.11, end: 587.2 },
    { id: "2.2-p3", start: 587.2, end: 612.85 },
    { id: "2.2-p4", start: 612.85, end: 625.15 },
    { id: "2.2-p5", start: 625.15, end: 676.26 },
    { id: "2.2-p6", start: 676.26, end: 723.27 },
    { id: "2.2-p7", start: 723.27, end: 754.57 },
    { id: "2.2-p8", start: 754.57, end: 776.29 },
    { id: "2.2-p9", start: 776.29, end: 796.73 },
    { id: "2.2-p10", start: 796.73, end: 800.72 },
    { id: "2.2-p11", start: 800.72, end: 804.99 },
    { id: "2.3-p0", start: 810.49, end: 818.23 },
    { id: "2.3-p1", start: 818.23, end: 857.85 },
    { id: "2.3-p2", start: 857.85, end: 894.81 },
    { id: "2.3-p3", start: 894.81, end: 898.91 },
    { id: "2.3-p4", start: 898.91, end: 922.42 },
    { id: "2.3-p5", start: 922.42, end: 928.71 },
    { id: "2.3-p6", start: 928.71, end: 961.4 },
    { id: "2.3-p7", start: 961.4, end: 978.15 },
    { id: "2.3-p8", start: 978.15, end: 1006.45 },
    { id: "2.3-p9", start: 1006.45, end: 1018.06 },
    { id: "2.3-p10", start: 1018.06, end: 1023.43 },
  ],
  "the-locked-door": [
    { id: "3.1-p0", start: 7.36, end: 40.09 },
    { id: "3.1-p1", start: 40.09, end: 80.17 },
    { id: "3.1-p2", start: 80.17, end: 102.54 },
    { id: "3.2-p0", start: 108.04, end: 115.57 },
    { id: "3.2-p1", start: 115.57, end: 160.78 },
    { id: "3.2-p2", start: 160.78, end: 187.96 },
    { id: "3.2-p3", start: 187.96, end: 212.68 },
    { id: "3.3-p0", start: 218.18, end: 223.36 },
    { id: "3.3-p1", start: 223.36, end: 257.18 },
    { id: "3.3-p2", start: 257.18, end: 289.67 },
    { id: "3.3-p3", start: 289.67, end: 319.86 },
    { id: "3.4-p0", start: 325.36, end: 357.19 },
    { id: "3.4-p1", start: 357.19, end: 361.95 },
    { id: "3.4-p2", start: 361.95, end: 378.77 },
  ],
  "nine-hundred-miles-south": [
    { id: "4.1-p0", start: 17.06, end: 20.3 },
    { id: "4.1-p1", start: 20.3, end: 50.7 },
    { id: "4.1-p2", start: 50.7, end: 72.84 },
    { id: "4.1-p3", start: 73.56, end: 96.6 },
    { id: "4.1-p4", start: 97.3, end: 122.12 },
    { id: "4.2-p0", start: 128.56, end: 137.64 },
    { id: "4.2-p1", start: 138.48, end: 168.16 },
    { id: "4.2-p2", start: 168.16, end: 215.86 },
    { id: "4.2-p4", start: 215.86, end: 247.74 },
    { id: "4.2-p5", start: 248.5, end: 277.48 },
    { id: "4.2-p6", start: 278.34, end: 297.18 },
    { id: "4.3-p0", start: 305.5, end: 313.04 },
    { id: "4.3-p1", start: 313.04, end: 395.26 },
    { id: "4.3-p2", start: 395.26, end: 421.94 },
    { id: "4.3-p3", start: 421.94, end: 442.0 },
    { id: "4.3-p4", start: 442.76, end: 460.08 },
    { id: "4.3-p5", start: 460.08, end: 478.26 },
    { id: "4.4-p0", start: 484.58, end: 488.58 },
    { id: "4.4-p1", start: 488.58, end: 516.16 },
    { id: "4.4-p2", start: 516.16, end: 537.36 },
    { id: "4.4-p3", start: 537.36, end: 568.12 },
    { id: "4.4a-p0", start: 575.56, end: 579.42 },
    { id: "4.4a-p1", start: 579.42, end: 615.34 },
    { id: "4.4a-p2", start: 616.22, end: 640.7 },
    { id: "4.5-p0", start: 647.68, end: 684.6 },
    { id: "4.5-p1", start: 684.6, end: 703.26 },
    { id: "4.5-p2", start: 703.26, end: 728.14 },
    { id: "4.6-p0", start: 734.56, end: 766.96 },
    { id: "4.6-p1", start: 766.96, end: 773.04 },
    { id: "4.6-p2", start: 773.04, end: 798.02 },
    { id: "4.6-p3", start: 798.02, end: 841.06 },
    { id: "4.6-p4", start: 841.82, end: 864.9 },
    { id: "4.6-p6", start: 864.9, end: 914.68 },
    { id: "4.6-p7", start: 915.56, end: 958.4 },
    { id: "4.6-p8", start: 958.4, end: 979.68 },
    { id: "4.6-p9", start: 979.68, end: 995.34 },
    { id: "4.6-p10", start: 995.34, end: 1053.58 },
    { id: "4.6-p12", start: 1053.58, end: 1063.52 },
  ],
};

export function cueAt(cues: ReadingCue[], time: number) {
  if (cues.length === 0 || time < cues[0].start) return null;
  const last = cues[cues.length - 1];
  if (time >= last.end) return null;
  for (const cue of cues) {
    if (time >= cue.start && time < cue.end) return cue;
  }
  return null;
}

/** Headings stay; sentence ids collapse to their paragraph. */
export function collapseToParagraphs(cues: ReadingCue[]): ReadingCue[] {
  const out: ReadingCue[] = [];
  for (const cue of cues) {
    const para = cue.id.match(/^(.*-p\d+)-s\d+$/);
    const id = para ? para[1] : cue.id;
    const last = out[out.length - 1];
    if (last && last.id === id) {
      last.end = cue.end;
    } else {
      out.push({ id, start: cue.start, end: cue.end });
    }
  }
  return out;
}

const ABBREV = new Set([
  "mr",
  "mrs",
  "ms",
  "dr",
  "st",
  "no",
  "vs",
  "jr",
  "sr",
  "gen",
  "col",
  "lt",
  "sgt",
  "maj",
  "cpl",
  "pfc",
  "capt",
  "wm",
  "gov",
  "sen",
  "rep",
  "hon",
  "rev",
  "ave",
  "blvd",
  "inc",
  "ltd",
  "co",
  "al",
  "etc",
  "vol",
  "jan",
  "feb",
  "mar",
  "apr",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
]);

function wordBefore(text: string, period: number) {
  let i = period - 1;
  while (i >= 0 && /[A-Za-z]/.test(text[i])) i -= 1;
  return text.slice(i + 1, period);
}

function isSentenceBreak(text: string, period: number) {
  const word = wordBefore(text, period);
  if (word.length === 1 && /[A-Z]/.test(word)) return false;
  if (ABBREV.has(word.toLowerCase())) return false;
  return true;
}

export function splitSentences(text: string): string[] {
  const parts: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "." && ch !== "!" && ch !== "?") continue;
    let j = i + 1;
    while (j < text.length && /\s/.test(text[j])) j += 1;
    if (j <= i + 1 || j >= text.length) continue;
    if (!/[A-Z“"‘]/.test(text[j])) continue;
    if (!isSentenceBreak(text, i)) continue;
    const piece = text.slice(start, j).trim();
    if (piece) parts.push(piece);
    start = j;
    i = j - 1;
  }
  const rest = text.slice(start).trim();
  if (rest) parts.push(rest);
  const merged: string[] = [];
  for (const part of parts.length > 0 ? parts : [text]) {
    const tiny = part.length < 12 || !/[a-z]/.test(part);
    if (merged.length > 0 && tiny) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${part}`;
    } else {
      merged.push(part);
    }
  }
  return merged.length > 0 ? merged : [text];
}

export function expandParagraphCue(
  cue: ReadingCue,
  text: string,
  pauses: number[] = [],
): ReadingCue[] {
  const sentences = splitSentences(text);
  if (sentences.length <= 1) return [{ ...cue, id: `${cue.id}-s0` }];
  const total = sentences.reduce((n, s) => n + s.length, 0) || 1;
  const span = cue.end - cue.start;
  const inner = pauses.filter(
    (t) => t > cue.start + 0.3 && t < cue.end - 0.2,
  );
  const used = new Set<number>();
  const edges = [cue.start];
  let acc = 0;
  for (let i = 0; i < sentences.length - 1; i++) {
    acc += sentences[i].length;
    const guess = cue.start + span * (acc / total);
    const last = edges[edges.length - 1];
    let best = guess;
    let bestDist = 2.2;
    for (const t of inner) {
      if (used.has(t) || t <= last + 0.4) continue;
      const d = Math.abs(t - guess);
      if (d < bestDist) {
        best = t;
        bestDist = d;
      }
    }
    if (best !== guess) used.add(best);
    edges.push(best);
  }
  edges.push(cue.end);
  return sentences.map((_, i) => ({
    id: `${cue.id}-s${i}`,
    start: Math.round(edges[i] * 100) / 100,
    end: Math.round(edges[i + 1] * 100) / 100,
  }));
}
