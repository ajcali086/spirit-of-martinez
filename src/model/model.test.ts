import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { globalId, recordById, recordForPlate, records } from "./index";
import { checks } from "./validate";

describe("model: H1 retrofit stage 1, records", () => {
  for (const check of checks) it(check.name, () => assert.deepEqual(check.run(), []));

  it("holds 115 records: 101 plates, verified, and 14 not held", () => {
    const count = (s: string) => records.filter((r) => r.status === s).length;
    assert.deepEqual(
      [
        records.length,
        records.filter((r) => r.plate).length,
        count("verified"),
        count("unverified"),
        count("not-held"),
      ],
      [115, 101, 101, 0, 14],
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

  it("writes global IDs with the museum's prefix", () => {
    assert.equal(globalId("r", "crew"), "spirit-of-martinez/r/crew");
  });
});
