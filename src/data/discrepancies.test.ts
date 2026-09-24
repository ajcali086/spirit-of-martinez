import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { chapterAnchorIds, chapterBySlug } from "./chapters.ts";
import { discrepancies } from "./discrepancies.ts";
import { missions } from "./missions.ts";
import { photos } from "./photos.ts";

const bookText =
  readFileSync(new URL("./chapters.ts", import.meta.url), "utf8") +
  readFileSync(new URL("./missions.ts", import.meta.url), "utf8");

/** An ellipsis marks where the register cut into a longer sentence; the rest
 * has to match the book character for character. */
const unelided = (quote: string) => quote.replace(/^…/, "").replace(/…$/, "");

describe("discrepancies", () => {
  it("gives every entry a unique id", () => {
    const ids = discrepancies.map((d) => d.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("points every entry at something", () => {
    for (const d of discrepancies) {
      assert.ok(
        d.paragraph || d.plate || d.mission != null,
        `${d.id} links nowhere`,
      );
    }
  });

  it("states the disagreement as either two claims or a note", () => {
    for (const d of discrepancies) {
      assert.ok(d.claims || d.note, `${d.id} states no disagreement`);
      if (d.claims) assert.equal(d.claims.length, 2, `${d.id} needs exactly two claims`);
    }
  });

  it("lands every passage link on an anchor that exists", () => {
    for (const d of discrepancies) {
      if (!d.paragraph) continue;
      const chapter = chapterBySlug(d.paragraph.slug);
      assert.ok(chapter, `${d.id}: no chapter "${d.paragraph.slug}"`);
      assert.ok(
        chapterAnchorIds(chapter!).has(d.paragraph.anchor),
        `${d.id}: no anchor "${d.paragraph.anchor}" in ${d.paragraph.slug}`,
      );
    }
  });

  it("lands every plate link on a real plate", () => {
    for (const d of discrepancies) {
      if (!d.plate) continue;
      assert.ok(photos[d.plate], `${d.id}: no plate "${d.plate}"`);
    }
  });

  it("lands every pin link on a real mission", () => {
    for (const d of discrepancies) {
      if (d.mission == null) continue;
      assert.ok(
        missions.some((m) => m.number === d.mission),
        `${d.id}: no mission ${d.mission}`,
      );
    }
  });

  // The register's whole claim is that it transcribes rather than writes. A
  // close line that cannot be found in the book is invented prose, which is
  // exactly what this page must not contain.
  it("quotes every close line verbatim from the book", () => {
    for (const d of discrepancies) {
      const quoted = unelided(d.close);
      assert.ok(
        bookText.includes(quoted),
        `${d.id}: close line is not verbatim in the book — ${JSON.stringify(quoted)}`,
      );
    }
  });

  it("quotes the note verbatim too, where an entry uses one", () => {
    for (const d of discrepancies) {
      if (!d.note) continue;
      assert.ok(
        bookText.includes(unelided(d.note)),
        `${d.id}: note is not verbatim in the book — ${JSON.stringify(unelided(d.note))}`,
      );
    }
  });

  it("keeps the thesis paragraph out of the entries", () => {
    // 14.5-p2 is the epigraph, not a disagreement of its own.
    for (const d of discrepancies) {
      assert.notEqual(d.paragraph?.anchor, "14.5-p2", `${d.id} duplicates the epigraph`);
    }
  });
});
