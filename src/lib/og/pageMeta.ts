export const SITE = "https://www.spiritofmartinez.com";

export const SITE_TITLE = "The Spirit of Martinez";

export const SITE_DESCRIPTION =
  "What a Family Kept — the Calicura family of Martinez, California, and the B-17 Flying Fortress that carried their town’s name over Europe in 1945.";

const IMAGE_PX: Record<string, readonly [number, number]> = {
  "/og.jpg": [1200, 630],
  "/images/hero-fortress.jpg": [1500, 844],
  "/images/treasure-island.jpg": [1792, 1008],
  "/images/houghton.jpg": [1792, 1008],
  "/images/b17-nose.jpg": [1728, 1152],
  "/images/horham.jpg": [1792, 1008],
  "/images/missions-banner.jpg": [1500, 599],
  "/images/noses-hero.jpg": [1125, 460],
  "/images/chowhound-banner.jpg": [1500, 599],
  "/images/footlocker.jpg": [1500, 844],
  "/images/watts-towers.jpg": [1500, 724],
  "/images/archive/airfield.jpg": [1500, 1074],
  "/images/archive/joyce.jpg": [1800, 1560],
  "/images/archive/shop.jpg": [1500, 1169],
  "/images/archive/og/maxwellpair.jpg": [1200, 630],
  "/images/archive/og/pocket.jpg": [1200, 630],
  "/images/archive/og/airportgroup.jpg": [1200, 630],
  "/images/archive/og/preflight.jpg": [1200, 630],
  "/images/archive/og/dogtags.jpg": [1200, 630],
  "/images/archive/og/flyingcover.jpg": [1200, 630],
  "/images/archive/og/carpenter.jpg": [1200, 630],
};

export function canonicalUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/") return `${SITE}/`;
  return `${SITE}${p.replace(/\/+$/, "")}`;
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE}${p}`;
}

function splitQuery(path: string) {
  const i = path.indexOf("?");
  if (i === -1) return { file: path, query: "" };
  return { file: path.slice(0, i), query: path.slice(i) };
}

/** Plate srcs are stored without an extension. Crawlers need a real file. */
export function assetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const { file, query } = splitQuery(path);
  const withExt = /\.(jpe?g|png|webp|gif|svg)$/i.test(file)
    ? file
    : `${file}.jpg`;
  return `${absoluteUrl(withExt)}${query}`;
}

/** Share crop if authored; otherwise the conventional 1200×630 file at archive/og/{id}.jpg. */
export function plateOgImage(photo: {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  ogImage?: string;
}) {
  const image = photo.ogImage ?? `/images/archive/og/${photo.id}.jpg`;
  return {
    image,
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: photo.alt,
  };
}

/** Chapter banners are not 1.91:1. Dedicated crops live at /images/og/{stem}.jpg. */
export function bannerOgImage(src: string, alt: string) {
  const stem = src.replace(/\.(jpe?g|png|webp)$/i, "").split("/").pop() ?? "og";
  return {
    image: `/images/og/${stem}.jpg`,
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: alt,
  };
}

export function pageMeta({
  title,
  description,
  path,
  image,
  type = "article",
  imageWidth,
  imageHeight,
  imageAlt,
}: {
  title: string;
  description: string;
  path: string;
  image: string;
  type?: "article" | "website";
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
}) {
  const url = canonicalUrl(path);
  const imageUrl = assetUrl(image);
  const known = IMAGE_PX[splitQuery(image).file];
  const width = imageWidth ?? known?.[0];
  const height = imageHeight ?? known?.[1];
  const meta: Array<
    { title: string } | { name: string; content: string } | { property: string; content: string }
  > = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
  ];
  if (width) meta.push({ property: "og:image:width", content: String(width) });
  if (height) meta.push({ property: "og:image:height", content: String(height) });
  if (imageAlt) meta.push({ property: "og:image:alt", content: imageAlt });
  meta.push(
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { name: "twitter:card", content: "summary_large_image" },
  );
  return {
    meta,
    links: [{ rel: "canonical", href: url }],
  };
}

/** Site-level card for home and indexes. Pass the baked cover path so ?v= survives. */
export const INDEX_META: Record<string, { title: string; description: string }> = {
  "/": { title: SITE_TITLE, description: SITE_DESCRIPTION },
  "/chapters": {
    title: "Fifteen chapters · The Spirit of Martinez",
    description:
      "Read in order, or open any chapter the way a family opens a box. Every chapter has a synthetic reading.",
  },
  "/timeline": {
    title: "A chronology · The Spirit of Martinez",
    description:
      "Figures someone had a reason to write down, 1902 to 1959, set in the order they happened — not the order the papers printed them.",
  },
  "/missions": {
    title: "Thirty-one sorties · The Spirit of Martinez",
    description:
      "Twenty-eight combat missions and three humanitarian drops. Joyce numbered the scrapbook to twenty-eight. The food carries no number at all.",
  },
  "/crew": {
    title: "Nine strangers · The Spirit of Martinez",
    description:
      "Eight names on a Tampa order of 30 August 1944. A ninth, the navigator, at Avon Park on 6 November.",
  },
  "/aircraft": {
    title: "Spirit of Martinez, 44-6838 · The Spirit of Martinez",
    description:
      "B-17G-65-DL Flying Fortress. Assigned to the 335th Bomb Squadron, 95th Bombardment Group (H), Station 119, Horham.",
  },
  "/archive": {
    title: "What the paperwork says · The Spirit of Martinez",
    description:
      "None of these documents agrees with all the others about exactly what happened, or exactly how many times it happened. A family kept everything anyway.",
  },
  "/sources": {
    title: "A note on sources · The Spirit of Martinez",
    description:
      "Four kinds of material sit behind every page. They do not agree with one another, and where they disagree the disagreement is stated rather than settled.",
  },
};

export function sitePageMeta(path: string, image = "/og.jpg") {
  const page = INDEX_META[path] ?? INDEX_META["/"];
  return pageMeta({
    title: page.title,
    description: page.description,
    path,
    image,
    type: "website",
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: page.title,
  });
}
