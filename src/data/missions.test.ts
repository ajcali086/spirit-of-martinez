import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { chapterAnchorIds, chapterBySlug } from "./chapters.ts";
import { HORHAM, THEATER, missionChapter, missionPlaces, missions, parseMissionsHash } from "./missions.ts";

describe("mission map data", () => {
  it("gives every sortie a modern center", () => {
    assert.equal(missions.length, 31);
    for (const m of missions) {
      assert.equal(typeof m.lat, "number");
      assert.equal(typeof m.lng, "number");
      assert.ok(m.lat > 47 && m.lat < 56);
      assert.ok(m.lng > 4 && m.lng < 16);
    }
  });

  it("keeps food drops numbered 29–31", () => {
    const food = missions.filter((m) => m.kind === "humanitarian");
    assert.deepEqual(
      food.map((m) => m.number),
      [29, 30, 31],
    );
  });

  it("shares one pin for repeated targets", () => {
    const places = missionPlaces(missions);
    const nuremberg = places.find((p) => p.target === "Nuremberg");
    const kiel = places.find((p) => p.target === "Kiel");
    const utrecht = places.find((p) => p.missions.every((m) => m.kind === "humanitarian"));
    assert.equal(nuremberg?.missions.length, 3);
    assert.equal(kiel?.missions.length, 2);
    assert.equal(utrecht?.missions.length, 3);
    assert.ok(places.length < 31);
  });

  it("places Horham west of the targets", () => {
    assert.ok(HORHAM.lng < Math.min(...missions.map((m) => m.lng)));
  });

  it("keeps every pin inside the theater bounds", () => {
    const [south, west] = THEATER.sw;
    const [north, east] = THEATER.ne;
    for (const p of [{ lat: HORHAM.lat, lng: HORHAM.lng }, ...missions]) {
      assert.ok(p.lat > south && p.lat < north);
      assert.ok(p.lng > west && p.lng < east);
    }
  });

  it("reads board hashes", () => {
    assert.deepEqual(parseMissionsHash("#map-6"), { view: "map", number: 6 });
    assert.deepEqual(parseMissionsHash("map"), { view: "map", number: 7 });
    assert.deepEqual(parseMissionsHash("#m-17"), { view: "list", number: 17 });
    assert.equal(parseMissionsHash("#other"), null);
  });

  it("lands every mission hash on a heading that exists", () => {
    for (const m of missions) {
      const dest = missionChapter(m);
      const chapter = chapterBySlug(dest.slug);
      assert.ok(chapter, dest.slug);
      assert.ok(
        chapterAnchorIds(chapter!).has(dest.hash),
        `mission ${m.number} → /chapters/${dest.slug}#${dest.hash}`,
      );
    }
  });

  it("gives Bamberg’s chart and Leipzig their own addresses", () => {
    const chapter = chapterBySlug("ninety-four-hours");
    const ids = chapterAnchorIds(chapter!);
    assert.equal(ids.has("m-7"), true);
    assert.equal(ids.has("m-9"), true);
    assert.equal(missionChapter(missions.find((m) => m.number === 7)!).hash, "m-7");
    assert.equal(missionChapter(missions.find((m) => m.number === 9)!).hash, "m-9");
  });
});
