import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Block, PhotoId } from "../data/types.ts";
import {
  figureAnchorId,
  figureRail,
  figureRuns,
  inlineFigureIds,
  shownInlineFigures,
} from "./figureLayout.ts";

const kind: Record<string, "photograph" | "object"> = {
  osnabruckclip: "object",
  nuremberg4: "object",
  nuremberg5: "object",
  stripes: "object",
  chart7: "object",
  form5: "object",
  nose: "photograph",
  crusher: "photograph",
  spiritpage: "object",
  crew: "photograph",
  namespread: "photograph",
  hamburg: "photograph",
};

function kindOf(id: PhotoId) {
  return kind[id] ?? "object";
}

describe("figureRuns", () => {
  it("groups consecutive plates and splits on a paragraph", () => {
    const blocks = [
      { type: "p", id: "m-3", text: "Osnabrück." },
      { type: "figure", id: "osnabruckclip" },
      { type: "figure", id: "nuremberg4" },
      { type: "figure", id: "nuremberg5" },
      { type: "figure", id: "stripes" },
      { type: "p", id: "10.1-p8", text: "Nine missions." },
      { type: "figure", id: "chart7" },
    ] as Block[];
    assert.deepEqual(figureRuns(blocks), [
      ["osnabruckclip", "nuremberg4", "nuremberg5", "stripes"],
      ["chart7"],
    ]);
  });
});

describe("inlineFigureIds", () => {
  it("keeps one clipping from a stack of papers, and a lone chart", () => {
    const blocks = [
      { type: "p", id: "m-3", text: "Osnabrück." },
      { type: "figure", id: "osnabruckclip" },
      { type: "figure", id: "nuremberg4" },
      { type: "figure", id: "nuremberg5" },
      { type: "figure", id: "stripes" },
      { type: "p", id: "10.1-p8", text: "Nine missions." },
      { type: "figure", id: "chart7" },
      { type: "p", id: "10.1-p9", text: "Hours." },
      { type: "figure", id: "form5" },
    ] as Block[];
    assert.deepEqual(
      [...inlineFigureIds(blocks, kindOf)],
      ["osnabruckclip", "chart7", "form5"],
    );
  });

  it("prefers a photograph when papers sit in the same run", () => {
    const blocks = [
      { type: "p", id: "11.3-p4", text: "The name." },
      { type: "figure", id: "nose" },
      { type: "figure", id: "crusher" },
      { type: "figure", id: "spiritpage" },
      { type: "figure", id: "crew" },
      { type: "figure", id: "namespread" },
    ] as Block[];
    assert.deepEqual([...inlineFigureIds(blocks, kindOf)], ["nose"]);
  });

  it("leaves a single plate in the reading", () => {
    const blocks = [
      { type: "p", id: "m-16", text: "Hamburg." },
      { type: "figure", id: "hamburg" },
    ] as Block[];
    assert.deepEqual([...inlineFigureIds(blocks, kindOf)], ["hamburg"]);
  });
});

describe("shownInlineFigures", () => {
  const stack = [
    { type: "p", id: "m-3", text: "Osnabrück." },
    { type: "figure", id: "osnabruckclip" },
    { type: "figure", id: "nuremberg4" },
    { type: "figure", id: "nuremberg5" },
  ] as Block[];

  it("leaves chapters before 10 alone", () => {
    assert.equal(shownInlineFigures(9, stack, kindOf), undefined);
  });

  it("caps from chapter 10", () => {
    const keep = shownInlineFigures(10, stack, kindOf);
    assert.ok(keep);
    assert.deepEqual([...keep], ["osnabruckclip"]);
  });
});

describe("figureAnchorId", () => {
  it("uses the mission hash when the figure carries one", () => {
    assert.equal(figureAnchorId("nuremberg4", 4), "m-4");
  });

  it("falls back to a plain figure id otherwise", () => {
    assert.equal(figureAnchorId("osnabruckclip"), "fig-osnabruckclip");
    assert.equal(figureAnchorId("osnabruckclip", undefined), "fig-osnabruckclip");
  });
});

describe("figureRail", () => {
  const missionOf = (id: PhotoId): number | undefined =>
    ({ nuremberg4: 4, nuremberg5: 5 })[id as string];

  it("lists every figure across sections, in order, mission or not", () => {
    const sections = [
      {
        blocks: [
          { type: "p", id: "m-3", text: "Osnabrück." },
          { type: "figure", id: "osnabruckclip" },
          { type: "figure", id: "nuremberg4" },
        ] as Block[],
      },
      {
        blocks: [
          { type: "figure", id: "nuremberg5" },
          { type: "p", id: "10.1-p8", text: "Nine missions." },
          { type: "figure", id: "chart7" },
        ] as Block[],
      },
    ];
    assert.deepEqual(figureRail(sections, missionOf), [
      { id: "osnabruckclip", anchorId: "fig-osnabruckclip", missionNumber: undefined },
      { id: "nuremberg4", anchorId: "m-4", missionNumber: 4 },
      { id: "nuremberg5", anchorId: "m-5", missionNumber: 5 },
      { id: "chart7", anchorId: "fig-chart7", missionNumber: undefined },
    ]);
  });

  it("includes figures a chapter-10+ reading would thin to door-only", () => {
    // shownInlineFigures would keep only "osnabruckclip" from this run at
    // chapter 10+, but the rail's job is showing the ones that got thinned.
    const sections = [
      {
        blocks: [
          { type: "p", id: "m-3", text: "Osnabrück." },
          { type: "figure", id: "osnabruckclip" },
          { type: "figure", id: "nuremberg4" },
          { type: "figure", id: "nuremberg5" },
        ] as Block[],
      },
    ];
    assert.equal(figureRail(sections, missionOf).length, 3);
  });

  it("returns an empty list for a chapter with no figures", () => {
    assert.deepEqual(figureRail([{ blocks: [] }], missionOf), []);
  });
});
