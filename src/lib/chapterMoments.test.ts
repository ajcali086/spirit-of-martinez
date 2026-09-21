import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { asMoments } from "./chapterMoments.ts";

const cues = [{ id: "7.1-p0-s0", start: 16.68, end: 25.66 }];
const body = { audio: "/audio/station-119.mp3", silent: [], weak: [], cues };

describe("asMoments", () => {
  it("accepts the JSON object itself", () => {
    assert.equal(asMoments(body)?.cues[0].id, "7.1-p0-s0");
  });

  it("accepts a Vite/ESM default wrap", () => {
    const m = asMoments({ default: body });
    assert.equal(m?.cues.length, 1);
    assert.equal(m?.audio, "/audio/station-119.mp3");
  });

  it("accepts a double default wrap", () => {
    const m = asMoments({ default: { default: body } });
    assert.equal(m?.cues[0].start, 16.68);
  });

  it("returns nothing for junk", () => {
    assert.equal(asMoments(null), null);
    assert.equal(asMoments({ default: 3 }), null);
  });
});
