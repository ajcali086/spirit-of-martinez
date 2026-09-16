export const SITE = "https://www.spiritofmartinez.com";

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

/** Plate srcs are stored without an extension. Crawlers need a real file. */
export function assetUrl(path: string) {
  if (/\.(jpe?g|png|webp|gif|svg)$/i.test(path)) return absoluteUrl(path);
  return absoluteUrl(`${path}.jpg`);
}

export function pageMeta({
  title,
  description,
  path,
  image,
  type = "article",
}: {
  title: string;
  description: string;
  path: string;
  image: string;
  type?: "article" | "website";
}) {
  const url = canonicalUrl(path);
  const imageUrl = assetUrl(image);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: imageUrl },
      { property: "og:url", content: url },
      { property: "og:type", content: type },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
