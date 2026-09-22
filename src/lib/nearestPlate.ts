// Relative, not "@/data/...": the test file for this module is run directly
// with `node --experimental-strip-types --test`, which doesn't understand
// the "@/" tsconfig path alias (the same limitation already affects
// src/data/cues.chapter10.test.ts). Vite resolves either form the same way.
import type { Chapter } from "../data/types.ts";
import { photos, type ArchivePhoto } from "../data/photos.ts";

/**
 * What SnippetCard draws in its image band: either a real plate from the
 * archive, credited as the archive credits it, or — when no plate sits near
 * this paragraph — the chapter's own hero image, uncredited (it isn't an
 * ArchivePhoto record and carries no `credit` field to show).
 */
export type PlateSource =
  | { kind: "plate"; photo: ArchivePhoto }
  | { kind: "chapter-image"; src: string; alt: string };

/**
 * Finds the plate a shared paragraph should show.
 *
 * A section's `blocks` are prose, quotes, notes, and figures in reading
 * order; a figure is a sibling of the paragraphs, not attached to one. So
 * this walks outward from the paragraph's own position for the nearest
 * `figure` block, one step at a time. On a tie — a figure equally far on
 * each side — the earlier one wins: it's the plate the reader already saw
 * leading into this text, not one still ahead of them.
 *
 * Falls back to the chapter's own image when the section or paragraph isn't
 * found, or no figure exists anywhere in that section.
 */
export function nearestPlate(
  chapter: Chapter,
  sectionId: string,
  paragraphId: string,
): PlateSource {
  const section = chapter.sections.find((s) => s.id === sectionId);
  const chapterImage = (): PlateSource => ({
    kind: "chapter-image",
    src: chapter.image,
    alt: chapter.imageAlt,
  });
  if (!section) return chapterImage();

  const idx = section.blocks.findIndex(
    (b) => b.type === "p" && b.id === paragraphId,
  );
  if (idx === -1) return chapterImage();

  const { blocks } = section;
  for (let d = 1; d < blocks.length; d++) {
    const before = idx - d >= 0 ? blocks[idx - d] : undefined;
    if (before?.type === "figure") {
      const photo = photos[before.id];
      if (photo) return { kind: "plate", photo };
    }
    const after = idx + d < blocks.length ? blocks[idx + d] : undefined;
    if (after?.type === "figure") {
      const photo = photos[after.id];
      if (photo) return { kind: "plate", photo };
    }
    if (idx - d < 0 && idx + d >= blocks.length) break;
  }
  return chapterImage();
}
