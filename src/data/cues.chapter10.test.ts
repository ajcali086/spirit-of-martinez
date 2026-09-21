import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { chapters } from "./chapters.ts";
import { cueAt, followCues } from "./cues.ts";

const SLUG = "ninety-four-hours";
const SILENT = [
  "10.1-p2",
  "10.1-p3",
  "10.1-p4",
  "10.1-p5",
  "10.1-p6",
  "10.1-p7",
];

const here = path.dirname(fileURLToPath(import.meta.url));

function loadAligned() {
  const raw = JSON.parse(
    readFileSync(
      path.join(here, "..", "generated", "moments", "cues", `${SLUG}.json`),
      "utf8",
    ),
  ) as { cues: { id: string; start: number; end: number }[]; silent: string[] };
  return raw;
}

describe("chapter 10 timing", () => {
  it("keeps the skipped mission lines on the page", () => {
    const chapter = chapters.find((c) => c.slug === SLUG)!;
    const ids = chapter.sections.flatMap((s) =>
      s.blocks.filter((b) => b.type === "p").map((b) => b.id),
    );
    assert.ok(ids.includes("m-4"));
    assert.ok(ids.includes("m-5"));
    assert.ok(ids.includes("m-7"));
    assert.ok(ids.includes("10.1-p6"));
  });

  it("does not highlight the six lines the reading skips", () => {
    const { cues, silent } = loadAligned();
    assert.deepEqual(silent, SILENT);
    const follow = followCues(cues, silent);
    for (const id of SILENT) {
      assert.equal(
        follow.some((c) => c.id === id),
        false,
        id,
      );
    }
  });

  it("holds Osnabrück until the spoken run resumes", () => {
    const { cues, silent } = loadAligned();
    const follow = followCues(cues, silent);
    assert.equal(cueAt(follow, 61)?.id, "10.1-p1");
    assert.equal(cueAt(follow, 62.5)?.id, "10.1-p1");
    assert.equal(cueAt(follow, 63)?.id, "10.1-p8");
  });
});
