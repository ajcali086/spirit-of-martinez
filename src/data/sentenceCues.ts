import type { ReadingCue } from "./cues";

/**
 * @deprecated Cue tables moved to src/generated/moments/cues/*.json.
 * Load them via loadChapterMoments() / hasChapterMoments() from
 * @/lib/chapterMoments. Kept empty so accidental sync imports stay tiny.
 */
export const sentenceCues: Record<string, ReadingCue[]> = {};
