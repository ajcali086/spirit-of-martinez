/** AAC-LC companions live next to every chapter MP3. Music (Skywatch) stays MP3. */
export const AAC_TYPE = 'audio/mp4; codecs="mp4a.40.2"';

export const AAC_QUERY = "v=3";

export function aacSrc(slug: string): string {
  return `/audio/${slug}.m4a?${AAC_QUERY}`;
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
  if (canPlayType(AAC_TYPE)) {
    return aacSrc(slug);
  }
  return fallback;
}

export function isAacSrc(src: string): boolean {
  return /\.m4a(\?|$)/.test(src);
}
