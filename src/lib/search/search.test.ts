import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { chapters } from "../../data/chapters.ts";
import { photoList, photos } from "../../data/photos.ts";
import { buildSearchIndex } from "./corpus.ts";
import { excerpt } from "./excerpt.ts";
import { isTypingTarget, normalize } from "./normalize.ts";
import { searchRecords } from "./query.ts";

test("the index matches the catalog", () => {
  const index = buildSearchIndex();
  assert.equal(chapters.length, 15);
  const paragraphs = chapters.reduce(
    (n, chapter) =>
      n + chapter.sections.reduce((s, section) => s + section.blocks.filter((b) => b.type === "p").length, 0),
    0,
  );
  assert.equal(index.filter((r) => r.group === "chapters").length, paragraphs);
  assert.equal(Object.keys(photos).length, photoList.length + 1);
  assert.equal(index.filter((r) => r.group === "plates").length, Object.keys(photos).length);
  const raw = readFileSync(new URL("../../generated/search-index.json", import.meta.url), "utf8");
  const parsed = JSON.parse(raw) as { group: string }[];
  assert.equal(parsed.length, index.length);
  assert.equal(parsed.filter((r) => r.group === "plates").length, Object.keys(photos).length);
});

test("Chemnitz opens chapter 9 at 9.1 and mission 01", () => {
  const groups = searchRecords(buildSearchIndex(), "Chemnitz");
  const chaptersGroup = groups.find((g) => g.id === "chapters");
  const missions = groups.find((g) => g.id === "missions");
  assert.ok(chaptersGroup);
  assert.equal(chaptersGroup.hits[0].type, "Chapter 09");
  assert.equal(chaptersGroup.hits[0].chip, "9.1");
  assert.match(chaptersGroup.hits[0].href, /^\/chapters\/mission-one#/);
  assert.ok(missions);
  assert.equal(missions.hits[0].type, "Mission 01");
  assert.equal(missions.hits[0].chip, "m-1");
  assert.equal(missions.hits[0].href, "/missions#m-1");
});

test("carpenter still surfaces the plate", () => {
  const groups = searchRecords(buildSearchIndex(), "carpenter");
  const plates = groups.find((g) => g.id === "plates");
  assert.ok(plates);
  assert.ok(plates.hits.some((hit) => hit.href === "/archive/carpenter"));
});

test("a short query does not search", () => {
  const index = buildSearchIndex();
  assert.deepEqual(searchRecords(index, ""), []);
  assert.deepEqual(searchRecords(index, "c"), []);
});

test("curly quotes and dashes match what was typed", () => {
  assert.equal(normalize("Frank’s war—Chemnitz"), "frank's war-chemnitz");
});

test("the slash shortcut stays out of a field", () => {
  assert.equal(isTypingTarget({ tagName: "input" }), true);
  assert.equal(isTypingTarget({ tagName: "textarea" }), true);
  assert.equal(isTypingTarget({ tagName: "div", isContentEditable: true }), true);
  assert.equal(isTypingTarget({ tagName: "body" }), false);
  assert.equal(isTypingTarget(null), false);
});

test("an excerpt keeps the match and stays near 180 characters", () => {
  const text =
    "A mission day at Horham followed the same sequence regardless of the target. For Frank Calicura’s crew, on this particular morning, the answer was Chemnitz — a marshalling yard in Saxony, part of the rail network still moving German men and material toward a collapsing eastern front.";
  const cut = excerpt(text, "Chemnitz");
  assert.ok(cut.text.length <= 190);
  assert.ok(cut.markStart >= 0);
  assert.match(cut.text.slice(cut.markStart, cut.markEnd), /Chemnitz/);
});
