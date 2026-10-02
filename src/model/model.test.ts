import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  entities,
  entitiesForRecord,
  entityBySlug,
  evidence,
  globalId,
  heldBack,
  missionEntity,
  questions,
  recordById,
  recordForPlate,
  records,
  settled,
} from "./index";
import { SERVICE_FILE } from "./types";
import { checks } from "./validate";

describe("model: H1 retrofit stages 1 to 3, records, entities, evidence and questions", () => {
  for (const check of checks) it(check.name, () => assert.deepEqual(check.run(), []));

  it("holds 130 records: 101 plates, verified, and 29 not held", () => {
    const count = (s: string) => records.filter((r) => r.status === s).length;
    assert.deepEqual(
      [
        records.length,
        records.filter((r) => r.plate).length,
        count("verified"),
        count("unverified"),
        count("not-held"),
      ],
      [130, 101, 101, 0, 29],
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

  it("carries the register: ten entries as eleven questions, and twenty-eight and thirty-one settled", () => {
    const carried = new Set(questions.map((q) => q.both_stand).filter(Boolean));
    assert.equal(carried.size, 10);
    assert.equal(questions.filter((q) => q.origin === "both-stand").length, 11);
    assert.deepEqual(
      questions.filter((q) => q.both_stand === "birth-years").map((q) => q.id),
      ["angelina-birth-year", "virginia-birth-year"],
    );
    assert.deepEqual(
      settled.map((s) => [s.both_stand, s.curator]),
      [["the-count", "Andrew"]],
    );
  });

  it("holds 20 questions: 11 from the register, 6 more from the archive, 3 from held-back names", () => {
    const count = (o: string) => questions.filter((q) => q.origin === o).length;
    assert.deepEqual(
      [questions.length, count("both-stand"), count("archive"), count("records")],
      [20, 11, 6, 3],
    );
    assert.equal(questions.filter((q) => q.archive).length, 8);
  });

  it("puts both sides of mission seven's date in view", () => {
    const q = questions.find((x) => x.id === "mission-seven-date")!;
    const links = q.evidence.map((id) => evidence.find((e) => e.id === id)!);
    assert.deepEqual(
      links.map((l) => [l.record, l.type]),
      [
        ["crewrecord", "supports"],
        ["chart7", "contradicts"],
      ],
    );
    assert.equal(links[1].says, "Hand-dated 23 Feb. 1945 and numbered Mission #7.");
    assert.ok(q.entities.includes(missionEntity(7)!.id));
  });

  it("enters the papers the book cites as records it doesn't hold, each at its passage", () => {
    const cited = records.filter((r) => r.cited_at);
    assert.equal(cited.length, 12);
    assert.ok(cited.every((r) => r.status === "not-held"));
    assert.deepEqual(recordById("registry")?.cited_at, {
      chapter: "what-came-back",
      passage: "13.2-p4",
    });
  });

  it("writes global IDs with the museum's prefix", () => {
    assert.equal(globalId("r", "crew"), "spirit-of-martinez/r/crew");
  });
});
