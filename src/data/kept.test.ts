import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { chapterAnchorIds, chapterBySlug, chapters } from "./chapters.ts";
import { keptEpigraph, keptRows, keptSentenceCount } from "./kept.ts";

const pin = JSON.parse(
  readFileSync(new URL("../generated/card-sentences.json", import.meta.url), "utf8"),
) as Record<string, Record<string, string[]>>;

/** Every string anywhere in a value: titles, deks, every block type. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const count = (text: string) => text.match(/\bkept\b/gi)?.length ?? 0;

// The page promises every "kept" in the chapters. Nothing here asserts 30:
// the tests check the rule, so the page stays true when the book changes.
describe("kept", () => {
  it("misses nothing in the chapters, and finds nothing the page can't show", () => {
    // Counted over the chapter data itself, without the pin, and over every
    // field — not only paragraphs. A "kept" added to a note, quote or title
    // lands here and fails, because the page could not show it.
    const inChapters = strings(chapters).reduce((n, s) => n + count(s), 0);
    assert.equal(keptRows.length, inChapters);
  });

  it("stores a split of the pinned sentence, never an edited copy", () => {
    for (const row of keptRows) {
      const pinned = pin[row.slug]?.[row.paragraph]?.[row.sentence];
      assert.equal(row.text, pinned, row.id);
      assert.equal(row.before + row.word + row.after, pinned, row.id);
    }
  });

  it("lands every row on an anchor that exists", () => {
    for (const row of keptRows) {
      const chapter = chapterBySlug(row.slug);
      assert.ok(chapter, `${row.id}: no chapter "${row.slug}"`);
      assert.ok(chapterAnchorIds(chapter!).has(row.paragraph), `${row.id}: no anchor`);
    }
  });

  it("gives every row a unique id", () => {
    // m-12 is a paragraph id in two chapters; the slug is what keeps them apart.
    const ids = keptRows.map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("keeps book order", () => {
    const position = new Map<string, number>();
    for (const ch of chapters) {
      for (const section of ch.sections) {
        for (const b of section.blocks) {
          if (b.type === "p" && b.id) position.set(`${ch.slug} ${b.id}`, position.size);
        }
      }
    }
    const key = (r: (typeof keptRows)[number]) => [
      position.get(`${r.slug} ${r.paragraph}`)!,
      r.sentence,
      r.before.length,
    ];
    for (let i = 1; i < keptRows.length; i++) {
      const [a, b] = [key(keptRows[i - 1]), key(keptRows[i])];
      const cmp = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
      assert.ok(cmp < 0, `${keptRows[i - 1].id} should come before ${keptRows[i].id}`);
    }
  });

  it("aligns every row on the word itself", () => {
    for (const row of keptRows) assert.match(row.word, /^kept$/i, row.id);
  });

  it("counts distinct sentences for the count line", () => {
    const triples = new Set(keptRows.map((r) => [r.slug, r.paragraph, r.sentence].join(" ")));
    assert.equal(keptSentenceCount, triples.size);
    assert.ok(keptSentenceCount <= keptRows.length);
  });

  it("quotes the epigraph from the pinned paragraph", () => {
    const pinned = pin[keptEpigraph.slug]?.[keptEpigraph.paragraph] ?? [];
    for (const sentence of keptEpigraph.sentences) {
      assert.ok(pinned.includes(sentence), `not pinned: ${sentence}`);
    }
  });
});
