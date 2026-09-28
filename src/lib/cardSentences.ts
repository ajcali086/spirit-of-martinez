import type { Chapter } from "../data/types.ts";

/**
 * Share-card sentences. Pinned by scripts/pin-card-sentences.ts into
 * src/generated/card-sentences.json.
 *
 * These arrays are card text. They do not time the gold band — src/data/cues.ts
 * splitSentences is the cue splitter, and the two must not be wired together.
 */

/** Ranks and titles this corpus actually breaks on. Not a general abbrev list. */
export const RANK_TITLES = [
  "Maj",
  "Gen",
  "Col",
  "Lt",
  "Capt",
  "Mr",
  "Mrs",
  "St",
  "No",
  "Vol",
] as const;

const RANK_END = new RegExp(`(?:^|[^A-Za-z])(?:${RANK_TITLES.join("|")})\\.$`);

/**
 * A non-final piece still ends in a trigger: a single capital initial (W.),
 * a rank or title (Lt.), or a dotted abbreviation (A.A.F.).
 * The check is the end of the piece, never the whole piece.
 */
export function endsWithTrigger(piece: string): boolean {
  const s = piece.trimEnd();
  if (/(?:^|[^A-Za-z])[A-Z]\.$/.test(s)) return true;
  if (RANK_END.test(s)) return true;
  if (/(?:^|[^A-Za-z])(?:[A-Z]\.){2,}$/.test(s)) return true;
  return false;
}

/** Glue raw Segmenter pieces until no non-final piece ends in a trigger. */
export function stitchSentences(pieces: readonly string[]): string[] {
  const out = pieces.slice();
  let i = 0;
  while (i < out.length - 1) {
    if (endsWithTrigger(out[i])) {
      out[i] = out[i] + out[i + 1];
      out.splice(i + 1, 1);
    } else {
      i += 1;
    }
  }
  return out;
}

export function segmentParagraph(text: string): string[] {
  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
  const raw = [...segmenter.segment(text)].map((part) => part.segment);
  return stitchSentences(raw)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

/** Raw Segmenter pieces, unstitched. The rejoin check uses these and nothing else. */
export function rawSegments(text: string): string[] {
  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
  return [...segmenter.segment(text)].map((part) => part.segment);
}

export type CardSentencePin = Record<string, Record<string, string[]>>;

export function cardSentences(chapters: readonly Chapter[]): CardSentencePin {
  const pin: CardSentencePin = {};
  for (const chapter of chapters) {
    const page: Record<string, string[]> = {};
    for (const section of chapter.sections) {
      for (const block of section.blocks) {
        if (block.type !== "p") continue;
        if (!block.id) {
          throw new Error(`paragraph without an id in ${chapter.slug} / ${section.id}`);
        }
        if (block.id in page) {
          throw new Error(`duplicate paragraph id ${block.id} in ${chapter.slug}`);
        }
        page[block.id] = segmentParagraph(block.text);
      }
    }
    pin[chapter.slug] = page;
  }
  return pin;
}
