import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TEXT_SCALE_BOOT,
  TEXT_SCALE_KEY,
  TEXT_SCALES,
  parseTextScale,
  textScalePercent,
} from "./textScale.ts";

describe("parseTextScale", () => {
  it("accepts the five steps and nothing else", () => {
    assert.deepEqual(
      TEXT_SCALES.map((n) => parseTextScale(String(n))),
      [...TEXT_SCALES],
    );
    assert.equal(parseTextScale(null), 1);
    assert.equal(parseTextScale(""), 1);
    assert.equal(parseTextScale("1.1"), 1);
    assert.equal(parseTextScale("2"), 1);
    assert.equal(parseTextScale("150%"), 1);
  });

  it("labels a step as a percent", () => {
    assert.deepEqual(TEXT_SCALES.map(textScalePercent), ["100%", "112%", "125%", "137%", "150%"]);
  });

  it("boots from the same key and the same steps", () => {
    assert.match(TEXT_SCALE_BOOT, new RegExp(TEXT_SCALE_KEY));
    for (const step of TEXT_SCALES) {
      assert.match(TEXT_SCALE_BOOT, new RegExp(String(step)));
    }
    assert.match(TEXT_SCALE_BOOT, /--chapter-text-scale/);
  });
});
