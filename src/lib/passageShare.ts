import { followCues } from "../data/cues.ts";
import type { Chapter } from "../data/types.ts";
import type { ChapterMoments } from "./chapterMoments.ts";

/** Cue id the gold band uses for this paragraph — mission kickers map to positional ids. */
export function paragraphCueId(chapter: Chapter, paraId: string): string {
  for (const section of chapter.sections) {
    let pIndex = 0;
    for (const b of section.blocks) {
      if (b.type !== "p") continue;
      const positional = `${section.id}-p${pIndex++}`;
      const id = b.id ?? positional;
      if (paraId === id || paraId === b.id || paraId === positional) {
        return b.id?.startsWith("m-") ? positional : id;
      }
    }
  }
  return paraId;
}

export function cueWindowForParagraph(
  chapter: Chapter,
  moments: ChapterMoments | null,
  paraId: string,
): { start: number; end: number } | null {
  if (!moments?.cues.length) return null;
  const cueId = paragraphCueId(chapter, paraId);
  if (moments.silent.includes(cueId) || moments.silent.includes(paraId)) {
    return null;
  }
  const follow = followCues(moments.cues, moments.silent);
  const hit = follow.find((c) => c.id === cueId || c.id === paraId);
  if (!hit) return null;
  if (hit.end <= hit.start) return null;
  return { start: hit.start, end: hit.end };
}

export function parseStartParam(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(String(raw));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function formatStartParam(seconds: number): string {
  const t = Math.round(seconds * 10) / 10;
  return Number.isInteger(t) ? String(t) : t.toFixed(1);
}

export function passageHref(slug: string, paraId: string, start?: number | null): string {
  const q = start != null ? `?t=${formatStartParam(start)}` : "";
  return `/chapters/${slug}${q}#${encodeURIComponent(paraId)}`;
}

export function formatListenLabel(seconds: number): string {
  const s = Math.max(1, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `Listen · ${m}:${r.toString().padStart(2, "0")}`;
}
