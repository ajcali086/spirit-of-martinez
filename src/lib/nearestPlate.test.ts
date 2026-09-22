import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nearestPlate } from "./nearestPlate.ts";
import type { Chapter, Section } from "../data/types.ts";
import { photos } from "../data/photos.ts";

function chapterWith(sections: Section[]): Chapter {
  return {
    number: 1,
    slug: "test-chapter",
    title: "Test Chapter",
    kicker: "Test",
    years: "1945",
    image: "/images/hero-fortress.jpg",
    imageAlt: "The chapter's own hero image",
    dek: "",
    sections,
  };
}

describe("nearestPlate", () => {
  it("picks the only figure in the section", () => {
    const chapter = chapterWith([
      {
        id: "1.1",
        title: "One",
        blocks: [
          { type: "p", text: "Before.", id: "1.1-p0" },
          { type: "figure", id: "crew" },
          { type: "p", text: "After.", id: "1.1-p1" },
        ],
      },
    ]);
    const result = nearestPlate(chapter, "1.1", "1.1-p0");
    assert.equal(result.kind, "plate");
    assert.equal(result.kind === "plate" && result.photo.id, "crew");
  });

  it("breaks a tie in favor of the earlier figure", () => {
    const chapter = chapterWith([
      {
        id: "1.1",
        title: "One",
        blocks: [
          { type: "figure", id: "crew" },
          { type: "p", text: "Between two figures.", id: "1.1-p0" },
          { type: "figure", id: "naming" },
        ],
      },
    ]);
    const result = nearestPlate(chapter, "1.1", "1.1-p0");
    assert.equal(result.kind, "plate");
    assert.equal(result.kind === "plate" && result.photo.id, "crew");
  });

  it("prefers the nearer figure over a farther one on the same side", () => {
    const chapter = chapterWith([
      {
        id: "1.1",
        title: "One",
        blocks: [
          { type: "figure", id: "crew" },
          { type: "p", text: "Filler.", id: "1.1-p0" },
          { type: "p", text: "Target.", id: "1.1-p1" },
          { type: "figure", id: "naming" },
        ],
      },
    ]);
    const result = nearestPlate(chapter, "1.1", "1.1-p1");
    assert.equal(result.kind, "plate");
    assert.equal(result.kind === "plate" && result.photo.id, "naming");
  });

  it("falls back to the chapter image when the section has no figure", () => {
    const chapter = chapterWith([
      {
        id: "1.1",
        title: "One",
        blocks: [{ type: "p", text: "No pictures here.", id: "1.1-p0" }],
      },
    ]);
    const result = nearestPlate(chapter, "1.1", "1.1-p0");
    assert.deepEqual(result, {
      kind: "chapter-image",
      src: chapter.image,
      alt: chapter.imageAlt,
    });
  });

  it("falls back to the chapter image for an unknown section or paragraph id", () => {
    const chapter = chapterWith([
      {
        id: "1.1",
        title: "One",
        blocks: [{ type: "p", text: "Text.", id: "1.1-p0" }],
      },
    ]);
    assert.equal(nearestPlate(chapter, "9.9", "1.1-p0").kind, "chapter-image");
    assert.equal(nearestPlate(chapter, "1.1", "1.1-p9").kind, "chapter-image");
  });

  it("every id used above is a real, credited archive photo", () => {
    assert.ok(photos.crew.credit);
    assert.ok(photos.naming.credit);
  });
});
