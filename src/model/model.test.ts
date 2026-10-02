import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  entities,
  entitiesForRecord,
  entityBySlug,
  globalId,
  heldBack,
  missionEntity,
  recordById,
  recordForPlate,
  records,
} from "./index";
import { SERVICE_FILE } from "./types";
import { checks } from "./validate";

describe("model: H1 retrofit stages 1 and 2, records and entities", () => {
  for (const check of checks) it(check.name, () => assert.deepEqual(check.run(), []));

  it("holds 118 records: 101 plates, verified, and 17 not held", () => {
    const count = (s: string) => records.filter((r) => r.status === s).length;
    assert.deepEqual(
      [
        records.length,
        records.filter((r) => r.plate).length,
        count("verified"),
        count("unverified"),
        count("not-held"),
      ],
      [118, 101, 101, 0, 17],
    );
  });

  it("holds mission 7's chart and knows of the other thirteen", () => {
    assert.equal(recordForPlate("chart7")?.held, true);
    const charts = records.filter((r) => /^chart\d+$/.test(r.id));
    assert.equal(charts.length, 14);
    assert.deepEqual(
      charts.filter((r) => !r.held).map((r) => r.id),
      [
        "chart1",
        "chart2",
        "chart3",
        "chart4",
        "chart5",
        "chart6",
        "chart8",
        "chart9",
        "chart10",
        "chart11",
        "chart12",
        "chart13",
        "chart14",
      ],
    );
  });

  it("knows of Joyce's scrapbook, which no plate photographs", () => {
    const scrapbook = recordById("scrapbook");
    assert.equal(scrapbook?.status, "not-held");
    assert.equal(scrapbook?.plate, undefined);
  });

  it("knows of the 1959 VA letter, which no plate shows", () => {
    assert.equal(recordById("valetter")?.status, "not-held");
  });

  it("files the service papers as a personnel file keeps them", () => {
    const filed = (series: string) =>
      records
        .filter((r) => r.series === series)
        .map((r) => r.id)
        .sort();
    assert.deepEqual(
      SERVICE_FILE.map((s) => [s, filed(s).length]),
      [
        ["personnel", 3],
        ["training", 4],
        ["orders", 1],
        ["flight", 17],
        ["awards", 1],
        ["supply", 2],
        ["legal", 2],
      ],
    );
    assert.deepEqual(filed("supply"), ["signatures", "ticket"]);
    assert.equal(recordById("signatures")?.detail_of, "ticket");
  });

  it("catalogs the orders by number, issuer, place and date", () => {
    assert.deepEqual(recordById("tampaorder")?.document, {
      type: "special-order",
      number: "Par 3, SO #243",
      issued_by: "Headquarters 3rd AFRD",
      issued_at: "Plant Park, Tampa",
      issued: "1944-08-30",
    });
    assert.equal(recordById("go289")?.document?.number, "GO 289");
    assert.equal(records.filter((r) => r.document).length, 19);
  });

  it("keeps the aircraft a record, not an entity", () => {
    assert.equal(recordById("aircraft")?.status, "not-held");
    assert.equal(recordById("aircraft")?.series, "aircraft");
    assert.ok(!entities.some((e) => /44-6838/.test(e.label)));
  });

  it("derives 89 entities: 28 people, 1 family, 15 places, 14 organizations, 31 missions", () => {
    const count = (k: string) => entities.filter((e) => e.kind === k).length;
    assert.deepEqual(
      ["person", "family", "place", "organization", "event"].map(count),
      [28, 1, 15, 14, 31],
    );
  });

  it("makes every mission an event anchored on the crew record, and the first fourteen on a chart", () => {
    for (let n = 1; n <= 31; n++) {
      const m = missionEntity(n)!;
      assert.ok(m.anchors.includes("crewrecord"), `mission ${n}`);
      assert.equal(m.anchors.includes(`chart${n}`), n <= 14, `mission ${n}`);
    }
    assert.equal(missionEntity(7)?.label, "Mission 7: Bremen, 24 February 1945");
  });

  it("never takes Frank James Calicura Jr. for his father", () => {
    const frank = entityBySlug("frank-calicura")!;
    const jimmy = entityBySlug("jimmy-calicura")!;
    assert.ok(!frank.anchors.includes("jimmy1"));
    assert.ok(jimmy.anchors.includes("jimmy1"));
    assert.deepEqual(
      entitiesForRecord("pregnant")
        .map((e) => e.slug)
        .sort(),
      ["731-mellus-street", "jimmy-calicura", "joyce-calicura"],
    );
  });

  it("merges a spelling only on the plate's word, dated and sourced", () => {
    const beatie = entityBySlug("charles-beatie")!;
    assert.deepEqual(beatie.identity_assertions[0].names, ["Charles Beattie"]);
    assert.deepEqual(beatie.identity_assertions[0].sources, ["tribune1939"]);
  });

  it("holds back the names the plates leave unsettled", () => {
    assert.deepEqual(
      heldBack.map((h) => h.label),
      [
        "Clark",
        "Sam Calicura (the 1940 notice)",
        "Sam Calicura (employer on the qualification record)",
        "Sam (the Gazette's)",
        "Olson",
        "Lt. Shaw",
        "Lt. Dillon",
        "Marie",
      ],
    );
  });

  it("writes global IDs with the museum's prefix", () => {
    assert.equal(globalId("r", "crew"), "spirit-of-martinez/r/crew");
  });
});
