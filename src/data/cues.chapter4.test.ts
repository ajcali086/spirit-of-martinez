import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { chapters } from "./chapters.ts";
import { chapterCues, collapseToParagraphs, cueAt } from "./cues.ts";
import { paragraphCuesFor, sectionSeeks } from "./sectionSeeks.ts";

const SLUG = "nine-hundred-miles-south";
const SKIPPED = new Set(["4.2-p3", "4.6-p5", "4.6-p11"]);

const here = path.dirname(fileURLToPath(import.meta.url));
const cuesPath = path.join(
  here,
  "..",
  "generated",
  "moments",
  "cues",
  `${SLUG}.json`,
);

function loadAligned() {
  const raw = JSON.parse(readFileSync(cuesPath, "utf8")) as {
    cues: { id: string; start: number; end: number }[];
  };
  return raw.cues;
}

describe("chapter 4 timing", () => {
  it("does not flash the three paragraphs the reading skips", () => {
    const aligned = loadAligned();
    assert.ok(aligned.length > 0);
    for (const cue of aligned) {
      const para = cue.id.match(/^(.*-p\d+)/)?.[1];
      assert.equal(SKIPPED.has(para ?? ""), false, cue.id);
    }
    const collapsed = collapseToParagraphs(aligned);
    for (const id of SKIPPED) {
      assert.equal(
        collapsed.some((c) => c.id === id),
        false,
      );
    }
  });

  it("keeps spoken paragraphs at a steady reading rate", () => {
    const chapter = chapters.find((c) => c.slug === SLUG)!;
    const windows = new Map(
      collapseToParagraphs(loadAligned())
        .filter((c) => /p\d+$/.test(c.id))
        .map((c) => [c.id, c]),
    );
    for (const section of chapter.sections) {
      for (const b of section.blocks) {
        if (b.type !== "p") continue;
        if (SKIPPED.has(b.id!)) continue;
        const cue = windows.get(b.id!);
        assert.ok(cue, b.id);
        const dur = cue!.end - cue!.start;
        if (b.text.length < 80) continue;
        const cps = b.text.length / dur;
        assert.ok(cps > 10 && cps < 26, `${b.id} ${cps.toFixed(1)} cps`);
      }
    }
  });

  it("agrees with FOLLOW and with the paragraph map", () => {
    const follow = paragraphCuesFor(SLUG)!;
    const paras = chapterCues[SLUG];
    for (const p of paras) {
      const f = follow.find((c) => c.id === p.id);
      assert.ok(f, p.id);
      assert.equal(f!.start, p.start);
      assert.equal(f!.end, p.end);
    }
  });

  it("starts each section on the spoken title, before the first paragraph", () => {
    const follow = paragraphCuesFor(SLUG)!;
    for (const seek of sectionSeeks[SLUG]) {
      const title = follow.find((c) => c.id === `sec-${seek.id}-title`);
      assert.ok(title, seek.id);
      assert.equal(seek.start, title!.start);
      const first = follow.find((c) => c.id.startsWith(`${seek.id}-p`));
      if (first) assert.ok(seek.start < first.start, seek.id);
    }
  });

  it("does not highlight a skipped paragraph at the join", () => {
    assert.equal(cueAt(paragraphCuesFor(SLUG)!, 215.86)?.id, "4.2-p4");
    assert.equal(cueAt(paragraphCuesFor(SLUG)!, 215.85)?.id, "4.2-p2");
    assert.equal(cueAt(paragraphCuesFor(SLUG)!, 864.9)?.id, "4.6-p6");
    assert.equal(cueAt(paragraphCuesFor(SLUG)!, 864.89)?.id, "4.6-p4");
    assert.equal(cueAt(paragraphCuesFor(SLUG)!, 1053.58)?.id, "4.6-p12");
    assert.equal(cueAt(paragraphCuesFor(SLUG)!, 1053.57)?.id, "4.6-p10");
  });
});
