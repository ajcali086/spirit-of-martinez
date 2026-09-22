// The import attribute is required by plain `node --test` (see
// scripts/test-register.mjs); Vite and tsc don't need it but accept it.
import manifest from "../generated/responsive-images.json" with { type: "json" };

type Entry = { width: number; height: number; variants: [number, string][] };
const images = manifest as unknown as Record<string, Entry>;

function keyFor(src: string) {
  return src.replace(/^\/images\//, "").replace(/\.(png|jpe?g|webp)$/i, "");
}

/** "/images/archive/jacket.jpg" -> "/images/archive/jacket-480w.webp 480w, ..." */
export function webpSrcSet(src: string): string | undefined {
  const entry = images[keyFor(src)];
  if (!entry?.variants.length) return undefined;
  return entry.variants.map(([w, f]) => `/images/${f} ${w}w`).join(", ");
}

export const SIZES = {
  banner: "100vw",
  chapterCard: "(min-width: 768px) 540px, calc(100vw - 32px)",
  tally: "(min-width: 768px) 206px, 176px",
  ship: "(min-width: 768px) 286px, 191px",
  continueThumb: "96px",
  catalog: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  objectThumb: "5rem",
} as const;
