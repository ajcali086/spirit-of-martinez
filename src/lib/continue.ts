import { chapterBySlug, retiredChapterSlugs } from "@/data/chapters";
import { isPhotoId, photos, plateNumber } from "@/data/photos";
import type { Place } from "@/lib/bookmark";

export const CONTINUE_KEY = "som.continue.v1";
const DISMISS_KEY = "som.continue.dismissed";

export type ContinueRecord = {
  kind: "chapter" | "plate";
  url: string;
  chapterNum?: number;
  chapterTitle?: string;
  plateNum?: number;
  plateTitle?: string;
  section: string;
  preview: string;
  image: string;
  savedAt: number;
};

export type ResolvedContinue = {
  kind: "chapter" | "plate";
  slug: string;
  hash: string;
  title: string;
  section: string;
  preview: string;
  image: string;
};

export function clipPreview(text: string, max = 90): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const sp = slice.lastIndexOf(" ");
  const cut = sp > 40 ? slice.slice(0, sp) : slice;
  return `${cut.replace(/[.,;:—-]+$/u, "")}…`;
}

export function findParagraph(slug: string, paragraphId: string) {
  const dest = retiredChapterSlugs[slug] ?? slug;
  const chapter = chapterBySlug(dest);
  if (!chapter || !paragraphId) return null;
  for (const section of chapter.sections) {
    for (const b of section.blocks) {
      if (b.type === "p" && b.id === paragraphId) {
        return {
          text: b.text,
          sectionId: section.id,
          sectionTitle: section.title,
        };
      }
    }
  }
  return null;
}

export function sectionLine(sectionId: string, sectionTitle: string) {
  if (sectionId && sectionTitle) return `${sectionId} · ${sectionTitle}`;
  return sectionTitle || sectionId;
}

function parsePath(url: string): {
  kind: "chapter" | "plate";
  slug: string;
  hash: string;
} | null {
  if (typeof url !== "string" || !url.startsWith("/")) return null;
  const [path, hash = ""] = url.split("#");
  const chapter = path.match(/^\/chapters\/([^/]+)$/);
  if (chapter?.[1]) {
    return { kind: "chapter", slug: chapter[1], hash };
  }
  const plate = path.match(/^\/archive\/([^/]+)$/);
  if (plate?.[1]) {
    return { kind: "plate", slug: plate[1], hash: "" };
  }
  return null;
}

export function parseContinue(raw: string | null): ContinueRecord | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<ContinueRecord>;
    if (v.kind !== "chapter" && v.kind !== "plate") return null;
    if (typeof v.url !== "string" || !parsePath(v.url)) return null;
    if (typeof v.section !== "string") return null;
    if (typeof v.preview !== "string") return null;
    if (typeof v.image !== "string" || !v.image) return null;
    const savedAt =
      typeof v.savedAt === "number" && Number.isFinite(v.savedAt) ? v.savedAt : 0;
    if (v.kind === "chapter") {
      if (typeof v.chapterNum !== "number" || v.chapterNum < 1) return null;
      if (typeof v.chapterTitle !== "string" || !v.chapterTitle) return null;
      return {
        kind: "chapter",
        url: v.url,
        chapterNum: v.chapterNum,
        chapterTitle: v.chapterTitle,
        section: v.section,
        preview: v.preview,
        image: v.image,
        savedAt,
      };
    }
    if (typeof v.plateNum !== "number" || v.plateNum < 1) return null;
    if (typeof v.plateTitle !== "string" || !v.plateTitle) return null;
    return {
      kind: "plate",
      url: v.url,
      plateNum: v.plateNum,
      plateTitle: v.plateTitle,
      section: v.section,
      preview: v.preview,
      image: v.image,
      savedAt,
    };
  } catch {
    return null;
  }
}

export function resolveContinue(record: ContinueRecord): ResolvedContinue | null {
  const parsed = parsePath(record.url);
  if (!parsed || parsed.kind !== record.kind) return null;
  if (record.kind === "chapter") {
    const dest = retiredChapterSlugs[parsed.slug] ?? parsed.slug;
    const chapter = chapterBySlug(dest);
    if (!chapter) return null;
    const para = parsed.hash ? findParagraph(dest, parsed.hash) : null;
    return {
      kind: "chapter",
      slug: dest,
      hash: para ? parsed.hash : "",
      title: record.chapterTitle || chapter.title,
      section: record.section || chapter.kicker,
      preview: record.preview || clipPreview(chapter.dek),
      image: record.image || chapter.image,
    };
  }
  if (!isPhotoId(parsed.slug)) return null;
  const photo = photos[parsed.slug];
  return {
    kind: "plate",
    slug: parsed.slug,
    hash: "",
    title: record.plateTitle || photo.title,
    section: record.section,
    preview: record.preview || clipPreview(photo.caption),
    image: record.image || photo.src,
  };
}

export function continueFromPlace(place: Place | null): ResolvedContinue | null {
  if (!place) return null;
  const dest = retiredChapterSlugs[place.slug] ?? place.slug;
  const chapter = chapterBySlug(dest);
  if (!chapter) return null;
  return {
    kind: "chapter",
    slug: dest,
    hash: "",
    title: chapter.title,
    section: chapter.kicker,
    preview: clipPreview(chapter.dek),
    image: chapter.image,
  };
}

export function isContinueDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function readContinue(): ContinueRecord | null {
  if (typeof window === "undefined") return null;
  try {
    return parseContinue(window.localStorage.getItem(CONTINUE_KEY));
  } catch {
    return null;
  }
}

export function writeContinue(record: ContinueRecord) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONTINUE_KEY, JSON.stringify(record));
  } catch {
    /* quota / private mode */
  }
}

export function dismissContinue() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONTINUE_KEY);
    window.sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* quota / private mode */
  }
}

export function displayContinue(place: Place | null): ResolvedContinue | null {
  if (isContinueDismissed()) return null;
  const stored = readContinue();
  if (stored) return resolveContinue(stored);
  return continueFromPlace(place);
}

export function chapterContinueRecord(input: {
  slug: string;
  paragraphId: string;
  sectionId: string;
  sectionTitle: string;
}): ContinueRecord | null {
  const dest = retiredChapterSlugs[input.slug] ?? input.slug;
  const chapter = chapterBySlug(dest);
  if (!chapter) return null;
  const para = findParagraph(dest, input.paragraphId);
  const url = para
    ? `/chapters/${dest}#${input.paragraphId}`
    : `/chapters/${dest}`;
  return {
    kind: "chapter",
    url,
    chapterNum: chapter.number,
    chapterTitle: chapter.title,
    section: sectionLine(input.sectionId, input.sectionTitle),
    preview: clipPreview(para?.text ?? chapter.dek),
    image: chapter.image,
    savedAt: Date.now(),
  };
}

export function plateContinueRecord(id: string): ContinueRecord | null {
  if (!isPhotoId(id)) return null;
  const photo = photos[id];
  const n = plateNumber(id);
  if (n < 1) return null;
  const kind = photo.kind === "photograph" ? "Photograph" : "Object";
  const section = photo.date ? `${kind} · ${photo.date}` : kind;
  return {
    kind: "plate",
    url: `/archive/${id}`,
    plateNum: n,
    plateTitle: photo.title,
    section,
    preview: clipPreview(photo.caption),
    image: photo.src,
    savedAt: Date.now(),
  };
}
