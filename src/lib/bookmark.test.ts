import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parsePlace } from "./bookmark.ts";

describe("parsePlace", () => {
  it("reads a saved chapter", () => {
    const place = parsePlace(
      JSON.stringify({
        slug: "mission-one",
        number: 9,
        title: "Mission One",
        time: 442,
      }),
    );
    assert.deepEqual(place, {
      slug: "mission-one",
      number: 9,
      title: "Mission One",
      time: 442,
      ended: false,
    });
  });

  it("rejects junk", () => {
    assert.equal(parsePlace(null), null);
    assert.equal(parsePlace("{"), null);
    assert.equal(parsePlace(JSON.stringify({ slug: "x" })), null);
  });
});
