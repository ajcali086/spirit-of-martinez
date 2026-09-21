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

/** Vite, Node, and Nitro each wrap JSON imports differently. */
export function asMoments(mod: unknown): ChapterMoments | null {
  let cur: unknown = mod;
  for (let i = 0; i < 3; i++) {
    if (!cur || typeof cur !== "object") return null;
    const rec = cur as {
      default?: unknown;
      audio?: unknown;
      cues?: unknown;
      silent?: unknown;
      weak?: unknown;
    };
    if (Array.isArray(rec.cues)) {
      return {
        audio: typeof rec.audio === "string" ? rec.audio : "",
        silent: Array.isArray(rec.silent) ? (rec.silent as string[]) : [],
        weak: Array.isArray(rec.weak) ? (rec.weak as string[]) : [],
        cues: rec.cues as ReadingCue[],
      };
    }
    if (rec.default && typeof rec.default === "object") {
      cur = rec.default;
      continue;
    }
    return null;
  }
  return null;
}

/** Explicit import map so Vite can code-split one JSON chunk per chapter. */
function importChapterMoments(
  slug: string,
): Promise<unknown> {
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
  const data = asMoments(await importChapterMoments(slug));
  if (!data) return null;
  cache.set(slug, data);
  return data;
}
