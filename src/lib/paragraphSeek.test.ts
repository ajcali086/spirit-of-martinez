import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isParagraphCue, registerSeekTap, seekStarts } from "./paragraphSeek.ts";

describe("isParagraphCue", () => {
  it("accepts paragraph ids, including lettered sections", () => {
    assert.equal(isParagraphCue("1.1-p0"), true);
    assert.equal(isParagraphCue("4.4a-p12"), true);
  });

  it("rejects headings and sentence ids", () => {
    assert.equal(isParagraphCue("sec-1.1-title"), false);
    assert.equal(isParagraphCue("ch-kicker"), false);
    assert.equal(isParagraphCue("1.1-p0-s2"), false);
  });
});

describe("registerSeekTap", () => {
  it("seeks on the second tap of the same paragraph inside the window", () => {
    const first = registerSeekTap(null, "1.1-p0", 1000);
    assert.equal(first.seek, false);
    const second = registerSeekTap(first.next, "1.1-p0", 1300);
    assert.equal(second.seek, true);
    assert.equal(second.next, null);
  });

  it("does not seek across paragraphs or after the window", () => {
    const first = registerSeekTap(null, "1.1-p0", 1000);
    assert.equal(registerSeekTap(first.next, "1.1-p1", 1200).seek, false);
    assert.equal(registerSeekTap(first.next, "1.1-p0", 1401).seek, false);
  });

  it("ignores a heading without forgetting the paragraph tap", () => {
    const first = registerSeekTap(null, "1.2-p3", 1000);
    const noise = registerSeekTap(first.next, "sec-1.2-id", 1100);
    assert.equal(noise.seek, false);
    assert.deepEqual(noise.next, first.next);
  });
});

describe("seekStarts", () => {
  it("collapses sentences, drops headings, and skips silent paragraphs", () => {
    const map = seekStarts(
      [
        { id: "sec-1.1-title", start: 1, end: 2 },
        { id: "1.1-p0", start: 3, end: 4 },
        { id: "1.1-p1-s0", start: 4, end: 5 },
        { id: "1.1-p1-s1", start: 5, end: 6 },
        { id: "4.4a-p0", start: 7, end: 8 },
      ],
      ["4.4a-p0"],
    );
    assert.equal(map.get("1.1-p0"), 3);
    assert.equal(map.get("1.1-p1"), 4);
    assert.equal(map.has("4.4a-p0"), false);
    assert.equal(map.has("sec-1.1-title"), false);
  });
});
