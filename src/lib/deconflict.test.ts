import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deconflictTops } from "./deconflict.ts";

describe("deconflictTops", () => {
  it("leaves a lone door on its paragraph", () => {
    assert.deepEqual(deconflictTops([{ anchorY: 80, height: 40 }]), [80]);
  });

  it("stacks five doors that share one paragraph", () => {
    const items = Array.from({ length: 5 }, () => ({ anchorY: 400, height: 90 }));
    assert.deepEqual(deconflictTops(items), [400, 495, 590, 685, 780]);
  });

  it("does not pull a later paragraph up into the strip", () => {
    assert.deepEqual(
      deconflictTops([
        { anchorY: 100, height: 40 },
        { anchorY: 100, height: 40 },
        { anchorY: 220, height: 40 },
      ]),
      [100, 145, 220],
    );
  });

  it("pushes a later door down when the previous strip overruns it", () => {
    assert.deepEqual(
      deconflictTops([
        { anchorY: 100, height: 80 },
        { anchorY: 150, height: 40 },
      ]),
      [100, 185],
    );
  });
});
