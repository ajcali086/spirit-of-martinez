const KEY = "som.place";

export type Place = {
  slug: string;
  number: number;
  title: string;
  time: number;
  ended?: boolean;
};

export function parsePlace(raw: string | null): Place | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Place>;
    if (typeof v.slug !== "string" || !v.slug) return null;
    if (typeof v.number !== "number" || v.number < 1) return null;
    if (typeof v.title !== "string") return null;
    const time = typeof v.time === "number" && Number.isFinite(v.time) && v.time > 0 ? v.time : 0;
    return {
      slug: v.slug,
      number: v.number,
      title: v.title,
      time,
      ended: v.ended === true,
    };
  } catch {
    return null;
  }
}

export function readPlace(): Place | null {
  if (typeof window === "undefined") return null;
  try {
    return parsePlace(window.localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function writePlace(place: Place) {
  if (typeof window === "undefined") return;
  const next: Place = {
    slug: place.slug,
    number: place.number,
    title: place.title,
    time: Number.isFinite(place.time) && place.time > 0 ? place.time : 0,
    ended: place.ended === true,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}
