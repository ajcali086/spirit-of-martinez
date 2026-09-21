import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { chapters } from "./chapters.ts";
import { collapseToParagraphs } from "./cues.ts";
import {
  firstParagraphCueId,
  paragraphCuesFor,
  sectionSeeksFor,
} from "./sectionSeeks.ts";
import type { ReadingCue } from "./cues.ts";

const here = path.dirname(fileURLToPath(import.meta.url));

function loadCues(slug: string): ReadingCue[] {
  const raw = JSON.parse(
    readFileSync(
      path.join(here, "..", "generated", "moments", "cues", `${slug}.json`),
      "utf8",
    ),
  ) as { cues: ReadingCue[] };
  return raw.cues;
}

describe("section seeks", () => {
  it("starts 11.3 on the spoken title, then the paragraph follows", () => {
    const chapter = chapters.find((c) => c.slug === "borrowed-aircraft");
    assert.ok(chapter);
    const section = chapter!.sections.find((s) => s.id === "11.3");
    assert.equal(section?.title, "How the Name Got There");
    const aligned = loadCues("borrowed-aircraft");
    const cues = paragraphCuesFor("borrowed-aircraft", aligned) ?? [];
    const title = cues.find((c) => c.id === "sec-11.3-title");
    const para = cues.find((c) => c.id === "11.3-p0");
    const seek = sectionSeeksFor(chapter!, aligned).find((s) => s.id === "11.3");
    assert.ok(title);
    assert.ok(para);
    assert.ok(seek);
    assert.equal(seek!.start, title!.start);
    assert.equal(seek!.start, 190.96);
    assert.ok(seek!.start < para!.start);
    assert.equal(firstParagraphCueId(section!), "11.3-p0");
    const spoken = collapseToParagraphs(aligned).find(
      (c) => c.id === "sec-11.3-title",
    );
    assert.equal(spoken?.start, seek!.start);
  });

  it("emits only for chapters that have a reading", () => {
    for (const ch of chapters) {
      const aligned = ch.audio ? loadCues(ch.slug) : undefined;
      const seeks = sectionSeeksFor(ch, aligned);
      if (!ch.audio) {
        assert.equal(seeks.length, 0);
        continue;
      }
      assert.ok(seeks.length > 0, ch.slug);
      for (const s of seeks) {
        assert.ok(Number.isFinite(s.start) && s.start >= 0, `${ch.slug} ${s.id}`);
      }
    }
  });

  it("skips untitled sections", () => {
    for (const ch of chapters) {
      const untitled = new Set(
        ch.sections.filter((s) => !s.title).map((s) => s.id),
      );
      const aligned = ch.audio ? loadCues(ch.slug) : undefined;
      for (const s of sectionSeeksFor(ch, aligned)) {
        assert.equal(untitled.has(s.id), false);
      }
    }
  });
});
