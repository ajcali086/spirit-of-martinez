import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FIND_DELAY_MS, findingVisible, seekSettled } from "./passageFind.ts";

describe("seekSettled", () => {
  it("is settled only while playing near the target", () => {
    assert.equal(seekSettled(82.9, 82.67, false), true);
    assert.equal(seekSettled(82.9, 82.67, true), false);
    assert.equal(seekSettled(10, 82.67, false), false);
  });
});

describe("findingVisible", () => {
  it("stays hidden for a fast seek", () => {
    assert.equal(findingVisible(FIND_DELAY_MS - 1, false), false);
    assert.equal(findingVisible(120, true), false);
  });

  it("shows only after the threshold, and never once the passage has landed", () => {
    assert.equal(findingVisible(FIND_DELAY_MS, false), true);
    assert.equal(findingVisible(900, false), true);
    assert.equal(findingVisible(900, true), false);
  });
});
