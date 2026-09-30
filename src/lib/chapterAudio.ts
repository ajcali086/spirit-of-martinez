/** AAC-LC companions live next to every chapter MP3. Music (Skywatch) stays MP3. */
export const AAC_TYPE = 'audio/mp4; codecs="mp4a.40.2"';

export const AAC_QUERY = "v=3";

/** Public copies in spirit-audio. The filename is unchanged; ?v= stays on the query. */
export const AUDIO_ORIGIN = "https://e5krwqut3ljb7kbi.public.blob.vercel-storage.com";

export function audioUrl(path: string): string {
  if (path.startsWith("https://")) return path;
  const q = path.indexOf("?");
  const file = (q === -1 ? path : path.slice(0, q)).replace(/^\/audio\//, "");
  const query = q === -1 ? "" : path.slice(q);
  return `${AUDIO_ORIGIN}/${file}${query}`;
}

export function aacSrc(slug: string, query = AAC_QUERY): string {
  return audioUrl(`/audio/${slug}.m4a?${query}`);
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
    const q = fallback.indexOf("?");
    return aacSrc(slug, q === -1 ? AAC_QUERY : fallback.slice(q + 1));
  }
  return audioUrl(fallback);
}

export function isAacSrc(src: string): boolean {
  return /\.m4a(\?|$)/.test(src);
}
