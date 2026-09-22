import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { chapters } from "../data/chapters.ts";
import { followCues } from "../data/cues.ts";
import type { ChapterMoments } from "./chapterMoments.ts";
import {
  cueWindowForParagraph,
  formatListenLabel,
  formatStartParam,
  paragraphCueId,
  parseStartParam,
  passageHref,
} from "./passageShare.ts";

const here = path.dirname(fileURLToPath(import.meta.url));

function loadMoments(slug: string): ChapterMoments {
  return JSON.parse(
    readFileSync(
      path.join(here, "..", "generated", "moments", "cues", `${slug}.json`),
      "utf8",
    ),
  ) as ChapterMoments;
}

describe("parseStartParam", () => {
  it("reads numbers and numeric strings", () => {
    assert.equal(parseStartParam(16.68), 16.68);
    assert.equal(parseStartParam("24.8"), 24.8);
    assert.equal(parseStartParam("0"), 0);
  });

  it("rejects junk", () => {
    assert.equal(parseStartParam(undefined), null);
    assert.equal(parseStartParam(""), null);
    assert.equal(parseStartParam("nope"), null);
    assert.equal(parseStartParam(-1), null);
    assert.equal(parseStartParam(Number.NaN), null);
  });
});

describe("formatStartParam", () => {
  it("keeps one decimal and drops .0", () => {
    assert.equal(formatStartParam(16.68), "16.7");
    assert.equal(formatStartParam(24), "24");
    assert.equal(formatStartParam(24.81), "24.8");
  });
});

describe("passageHref", () => {
  it("puts t before the paragraph hash", () => {
    assert.equal(
      passageHref("station-119", "7.1-p0", 16.68),
      "/chapters/station-119?t=16.7#7.1-p0",
    );
  });

  it("omits t when the paragraph is silent", () => {
    assert.equal(
      passageHref("ninety-four-hours", "m-9"),
      "/chapters/ninety-four-hours#m-9",
    );
  });
});

describe("formatListenLabel", () => {
  it("rounds to a whole second", () => {
    assert.equal(formatListenLabel(9.2), "Listen · 0:09");
    assert.equal(formatListenLabel(62.4), "Listen · 1:02");
  });
});

describe("paragraphCueId", () => {
  it("maps mission kicker m-3 to the positional id Follow uses", () => {
    const chapter = chapters.find((c) => c.slug === "ninety-four-hours")!;
    assert.equal(paragraphCueId(chapter, "m-3"), "10.1-p3");
    assert.equal(paragraphCueId(chapter, "10.1-p3"), "10.1-p3");
  });
});

describe("cueWindowForParagraph", () => {
  it("uses the same window the gold band uses for Osnabrück", () => {
    const chapter = chapters.find((c) => c.slug === "ninety-four-hours")!;
    const moments = loadMoments("ninety-four-hours");
    const window = cueWindowForParagraph(chapter, moments, "m-3");
    const follow = followCues(moments.cues, moments.silent);
    const hit = follow.find((c) => c.id === "10.1-p3");
    assert.ok(window);
    assert.ok(hit);
    assert.equal(window!.start, hit!.start);
    assert.equal(window!.end, hit!.end);
  });

  it("returns nothing for a silent paragraph", () => {
    const chapter = chapters.find((c) => c.slug === "station-119")!;
    const moments = loadMoments("station-119");
    assert.equal(cueWindowForParagraph(chapter, moments, "7.2-p4"), null);
  });

  it("returns nothing for Leipzig, which the reading does not speak", () => {
    const chapter = chapters.find((c) => c.slug === "ninety-four-hours")!;
    const moments = loadMoments("ninety-four-hours");
    assert.equal(paragraphCueId(chapter, "m-9"), "10.2-p2");
    assert.equal(cueWindowForParagraph(chapter, moments, "m-9"), null);
  });
});
