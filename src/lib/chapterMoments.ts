import type { ReadingCue } from "@/data/cues";

/** Per-chapter moments payload committed under src/generated/moments/cues/. */
export type ChapterMoments = {
  audio: string;
  silent: string[];
  weak: string[];
  cues: ReadingCue[];
};

export const CHAPTER_MOMENT_SLUGS = [
  "borrowed-aircraft",
  "eight-empty-places",
  "mission-one",
  "nine-hundred-miles-south",
  "nine-strangers",
  "ninety-four-hours",
  "station-119",
  "the-locked-door",
  "the-number",
  "the-specialist",
  "the-strip-by-the-tracks",
  "uncle-sam",
  "utrecht",
  "weight-of-small-machines",
  "what-came-back",
] as const;

export type ChapterMomentSlug = (typeof CHAPTER_MOMENT_SLUGS)[number];

const slugSet = new Set<string>(CHAPTER_MOMENT_SLUGS);

export function hasChapterMoments(slug: string): boolean {
  return slugSet.has(slug);
}

const cache = new Map<string, ChapterMoments>();

/** Explicit import map so Vite can code-split one JSON chunk per chapter. */
function importChapterMoments(
  slug: string,
): Promise<{ default: ChapterMoments }> {
  switch (slug) {
    case "borrowed-aircraft":
      return import("@/generated/moments/cues/borrowed-aircraft.json");
    case "eight-empty-places":
      return import("@/generated/moments/cues/eight-empty-places.json");
    case "mission-one":
      return import("@/generated/moments/cues/mission-one.json");
    case "nine-hundred-miles-south":
      return import("@/generated/moments/cues/nine-hundred-miles-south.json");
    case "nine-strangers":
      return import("@/generated/moments/cues/nine-strangers.json");
    case "ninety-four-hours":
      return import("@/generated/moments/cues/ninety-four-hours.json");
    case "station-119":
      return import("@/generated/moments/cues/station-119.json");
    case "the-locked-door":
      return import("@/generated/moments/cues/the-locked-door.json");
    case "the-number":
      return import("@/generated/moments/cues/the-number.json");
    case "the-specialist":
      return import("@/generated/moments/cues/the-specialist.json");
    case "the-strip-by-the-tracks":
      return import("@/generated/moments/cues/the-strip-by-the-tracks.json");
    case "uncle-sam":
      return import("@/generated/moments/cues/uncle-sam.json");
    case "utrecht":
      return import("@/generated/moments/cues/utrecht.json");
    case "weight-of-small-machines":
      return import("@/generated/moments/cues/weight-of-small-machines.json");
    case "what-came-back":
      return import("@/generated/moments/cues/what-came-back.json");
    default:
      return Promise.reject(new Error(`No moments for chapter: ${slug}`));
  }
}

export async function loadChapterMoments(
  slug: string,
): Promise<ChapterMoments | null> {
  if (!hasChapterMoments(slug)) return null;
  const hit = cache.get(slug);
  if (hit) return hit;
  const mod = await importChapterMoments(slug);
  const data = mod.default;
  cache.set(slug, data);
  return data;
}
