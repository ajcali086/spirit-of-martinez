import pinned from "../generated/card-sentences.json" with { type: "json" };
import type { CardSentencePin } from "../lib/cardSentences.ts";
import { chapters } from "./chapters.ts";

/**
 * The concordance of *kept*: every use of the word in the chapters, one row
 * per occurrence, in book order.
 *
 * *Kept* is the book's one thesis word — the work is cited as "What a Family
 * Kept". This file is built for that word alone and takes no keyword on
 * purpose: a second concordance needs a word named as a thesis word first,
 * not a parameter.
 *
 * Scope is the chapters, nothing else. Plate captions, /sources, the archive
 * intro and the map notes also use the word; none of them are here, and the
 * page says "from the chapters" so the claim stays exact.
 *
 * Rows are split from the pinned share-card sentences, never re-segmented, so
 * a row and a card can never disagree about where a sentence ends. Nothing in
 * this file is new prose.
 */
export type KeptRow = {
  /** DOM id and deep-link hash. Carries the slug: paragraph ids are not unique across chapters. */
  id: string;
  slug: string;
  /** Paragraph id; an anchor on the chapter page. */
  paragraph: string;
  /** Index into the pinned sentence array for the paragraph. */
  sentence: number;
  /** The whole pinned sentence. `before + word + after` is exactly this. */
  text: string;
  before: string;
  word: string;
  after: string;
};

const pin = pinned as CardSentencePin;

export const KEPT = /\bkept\b/gi;

function buildRows(): KeptRow[] {
  const rows: KeptRow[] = [];
  // Walk the chapters rather than the JSON: book order is the contract, and
  // JSON key order only happens to match it.
  for (const chapter of chapters) {
    const page = pin[chapter.slug] ?? {};
    for (const section of chapter.sections) {
      for (const block of section.blocks) {
        if (block.type !== "p" || !block.id) continue;
        const sentences = page[block.id] ?? [];
        sentences.forEach((text, sentence) => {
          let nth = 0;
          for (const match of text.matchAll(KEPT)) {
            nth += 1;
            const at = match.index;
            const base = `${chapter.slug}.${block.id}.s${sentence}`;
            rows.push({
              id: nth === 1 ? base : `${base}.${nth}`,
              slug: chapter.slug,
              paragraph: block.id!,
              sentence,
              text,
              before: text.slice(0, at),
              word: match[0],
              after: text.slice(at + match[0].length),
            });
          }
        });
      }
    }
  }
  return rows;
}

export const keptRows: KeptRow[] = buildRows();

/** Distinct sentences, for the count line. */
export const keptSentenceCount = new Set(
  keptRows.map((r) => `${r.slug}\u0000${r.paragraph}\u0000${r.sentence}`),
).size;

/** The one chosen thing on the page. Both sentences are also rows. */
export const keptEpigraph = {
  slug: "weight-of-small-machines",
  paragraph: "1.2-p3",
  sentences: ["The family kept the objects.", "The institutions kept the numbers."],
} as const;
