import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { chapters } from "./chapters.ts";
import { cueAt, followCues } from "./cues.ts";

const SLUG = "ninety-four-hours";

const here = path.dirname(fileURLToPath(import.meta.url));

function loadAligned() {
  return JSON.parse(
    readFileSync(
      path.join(here, "..", "generated", "moments", "cues", `${SLUG}.json`),
      "utf8",
    ),
  ) as { cues: { id: string; start: number; end: number }[]; silent: string[] };
}

function spokenParagraphs() {
  const chapter = chapters.find((c) => c.slug === SLUG)!;
  const section = chapter.sections.find((s) => s.id === "10.1")!;
  return section.blocks.filter((b) => b.type === "p");
}

describe("chapter 10 listen sync", () => {
  it("keeps 10.1-p0, p8, and p9, and no longer pads the stretch with silent mission blurbs", () => {
    const paras = spokenParagraphs();
    const ids = paras.map((b) => b.id);
    assert.deepEqual(ids, ["10.1-p0", "10.1-p1", "10.1-p2", "m-3", "10.1-p8", "10.1-p9"]);
    assert.equal(
      paras.find((b) => b.id === "10.1-p1")?.text.startsWith("Frank Calicura’s crew flew again"),
      true,
    );
    assert.equal(
      paras.find((b) => b.id === "10.1-p2")?.text,
      "One of these has a clipping of its own beyond those already quoted.",
    );
  });

  it("has no silent placeholders in this stretch", () => {
    const { silent } = loadAligned();
    assert.equal(silent.includes("10.1-p2"), false);
    assert.equal(silent.includes("10.1-p1"), false);
  });

  it("advances with the voice from the list through the clipping to nine missions", () => {
    const { cues, silent } = loadAligned();
    const follow = followCues(cues, silent);
    assert.equal(cueAt(follow, 20)?.id, "10.1-p0");
    assert.equal(cueAt(follow, 30)?.id, "10.1-p1");
    assert.equal(cueAt(follow, 44)?.id, "10.1-p2");
    assert.equal(cueAt(follow, 55)?.id, "10.1-p3");
    assert.equal(cueAt(follow, 64)?.id, "10.1-p8");
  });
});
