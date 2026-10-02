import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FIGURE_MISSION } from "./chapters.ts";
import {
  RELATED_CAP,
  entriesForMission,
  entriesForPhoto,
  missionForNumber,
  missionsForPhoto,
  photosForMission,
  relatedByPerson,
  relatedPhotos,
} from "./connections.ts";
import { isCrewPlate } from "./crew.ts";
import { discrepancies } from "./discrepancies.ts";
import { missions } from "./missions.ts";
import { isPhotoId, photoList } from "./photos.ts";

const index = new Map(photoList.map((p, i) => [p.id as string, i]));

describe("connections", () => {
  it("ties every FIGURE_MISSION plate to its mission, and every tie to a real mission", () => {
    for (const [id, n] of Object.entries(FIGURE_MISSION)) {
      assert.ok(isPhotoId(id), id);
      assert.ok(missionsForPhoto(id).includes(n as number), id);
    }
    for (const p of photoList)
      for (const n of missionsForPhoto(p.id)) {
        assert.ok(n >= 1 && n <= 31, `${p.id}: ${n}`);
        assert.ok(
          missions.some((m) => m.number === n),
          `${p.id}: ${n}`,
        );
        assert.ok(missionForNumber(n)?.target, `${p.id}: ${n}`);
      }
  });

  it("makes photosForMission the exact inverse of missionsForPhoto", () => {
    const forward = photoList.flatMap((p) => missionsForPhoto(p.id).map((n) => `${p.id}>${n}`));
    const back = missions.flatMap((m) =>
      photosForMission(m.number).map((id) => `${id}>${m.number}`),
    );
    assert.deepEqual(back.sort(), forward.sort());
  });

  it("relates plates by a shared person: never itself, never a whole-crew plate, nearest first, at most three each", () => {
    for (const p of photoList) {
      const here = index.get(p.id)!;
      for (const { via, photos } of relatedByPerson(p.id)) {
        assert.ok(photos.length <= RELATED_CAP, `${p.id} via ${via}`);
        assert.ok(!photos.includes(p.id), p.id);
        assert.ok(
          photos.every((id) => isPhotoId(id) && !isCrewPlate(id)),
          p.id,
        );
        const dist = photos.map((id) => Math.abs(index.get(id)! - here));
        assert.deepEqual(
          dist,
          [...dist].sort((a, b) => a - b),
          `${p.id} via ${via}`,
        );
      }
    }
  });

  it("points only at register entries that exist, and plates that exist", () => {
    for (const p of photoList)
      for (const d of entriesForPhoto(p.id))
        assert.ok(discrepancies.includes(d) && isPhotoId(d.plate!));
    for (const m of missions)
      for (const d of entriesForMission(m.number)) assert.ok(discrepancies.includes(d));
  });

  it("matches what the plates say", () => {
    assert.ok(
      relatedPhotos("london").some((r) => r.id === "clarkbarnes" && r.via === "John R. Barnes"),
    );
    assert.deepEqual(photosForMission(7), ["chart7"]);
    assert.deepEqual(missionsForPhoto("carpenter"), []);
    assert.deepEqual(missionsForPhoto("hamburg"), [16]);
    assert.deepEqual(missionsForPhoto("stripesspread"), [5, 6]);
    assert.deepEqual(relatedPhotos("unknownpilot"), []);
    assert.deepEqual(
      entriesForPhoto("chart7").map((d) => d.id),
      ["chart-date"],
    );
    assert.deepEqual(
      entriesForMission(17).map((d) => d.id),
      ["m17-target"],
    );
  });
});
