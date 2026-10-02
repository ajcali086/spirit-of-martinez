import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { globalId, recordById, recordForPlate, records } from "./index";
import { SERVICE_FILE } from "./types";
import { checks } from "./validate";

describe("model: H1 retrofit stage 1, records", () => {
  for (const check of checks) it(check.name, () => assert.deepEqual(check.run(), []));

  it("holds 116 records: 101 plates, verified, and 15 not held", () => {
    const count = (s: string) => records.filter((r) => r.status === s).length;
    assert.deepEqual(
      [
        records.length,
        records.filter((r) => r.plate).length,
        count("verified"),
        count("unverified"),
        count("not-held"),
      ],
      [116, 101, 101, 0, 15],
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
        ["flight", 16],
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

  it("writes global IDs with the museum's prefix", () => {
    assert.equal(globalId("r", "crew"), "spirit-of-martinez/r/crew");
  });
});
