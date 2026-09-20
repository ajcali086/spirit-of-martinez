/** Chapters with a duration-checked AAC-LC file next to the MP3. */
export const AAC_CHAPTERS = new Set(["weight-of-small-machines"]);

export const AAC_TYPE = 'audio/mp4; codecs="mp4a.40.2"';

export function aacSrc(slug: string): string {
  return `/audio/${slug}.m4a?v=1`;
}

function browserCanPlayType(type: string): string {
  if (typeof Audio === "undefined") return "";
  try {
    return new Audio().canPlayType(type);
  } catch {
    return "";
  }
}

export function pickChapterAudio(
  slug: string,
  fallback: string,
  canPlayType: (type: string) => string = browserCanPlayType,
): string {
  if (AAC_CHAPTERS.has(slug) && canPlayType(AAC_TYPE)) {
    return aacSrc(slug);
  }
  return fallback;
}

export function isAacSrc(src: string): boolean {
  return /\.m4a(\?|$)/.test(src);
}
