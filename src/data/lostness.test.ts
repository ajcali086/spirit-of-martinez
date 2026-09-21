import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { crewForPhoto, isCrewPlate } from "./crew";
import { isPhotoId } from "./photos";
import { timeline } from "./timeline";

describe("lostness", () => {
  it("every timeline event has a door", () => {
    const missing = timeline.filter((e) => !e.href);
    assert.deepEqual(
      missing.map((e) => e.id),
      [],
    );
  });

  it("identity card and crusher open onto Frank", () => {
    assert.equal(crewForPhoto("idcard")[0]?.id, "calicura");
    assert.equal(crewForPhoto("airmanid")[0]?.id, "calicura");
    assert.equal(crewForPhoto("crusher")[0]?.id, "calicura");
  });

  it("the London pass names Frank, Barnes, and Probst", () => {
    assert.deepEqual(
      crewForPhoto("london").map((m) => m.id),
      ["calicura", "barnes", "probst"],
    );
  });

  it("Barnes’s plate opens onto Barnes", () => {
    assert.equal(crewForPhoto("barnes")[0]?.id, "barnes");
  });

  it("the crew sitting is a roster plate", () => {
    assert.equal(isCrewPlate("crew"), true);
    assert.equal(isCrewPlate("idcard"), false);
  });

  it("unknown archive and crew slugs are not in the collection", () => {
    assert.equal(isPhotoId("not-a-plate"), false);
  });
});
