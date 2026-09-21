import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { webpSrcSet } from "./srcset.ts";

describe("webpSrcSet", () => {
  it("lists the hero rungs a phone can pick from", () => {
    const set = webpSrcSet("/images/hero-fortress.jpg");
    assert.match(set ?? "", /hero-fortress-480w\.webp 480w/);
    assert.match(set ?? "", /hero-fortress-800w\.webp 800w/);
    assert.match(set ?? "", /hero-fortress\.webp 1500w/);
  });

  it("uses the mark rungs for the tally graphic", () => {
    const set = webpSrcSet("/images/marks/tally");
    assert.match(set ?? "", /marks\/tally-400w\.webp 400w/);
    assert.match(set ?? "", /marks\/tally\.webp 1445w/);
  });

  it("returns nothing for an unknown path", () => {
    assert.equal(webpSrcSet("/images/does-not-exist.jpg"), undefined);
  });
});
