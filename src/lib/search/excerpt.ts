import { splitSentences } from "../../data/cues.ts";
import { normalizeWithMap } from "./normalize.ts";

const LIMIT = 180;

export type Excerpt = {
  text: string;
  /** Indexes into `text`. -1 when the query is not in the window. */
  markStart: number;
  markEnd: number;
};

/**
 * Match-centered window, cut on the same sentence boundaries as the
 * passage card. About 180 characters. Ellipsis marks a cut.
 */
export function excerpt(body: string, query: string, limit = LIMIT): Excerpt {
  const clean = body.replace(/\s+/g, " ").trim();
  if (!clean) return { text: "", markStart: -1, markEnd: -1 };
  const q = normalizeWithMap(query).text;
  const { text: norm, map } = normalizeWithMap(clean);
  const at = q.length >= 2 ? norm.indexOf(q) : -1;
  if (at < 0) return windowOf(clean, 0, Math.min(clean.length, limit), -1, -1, limit);

  const origStart = map[at];
  const origEnd = map[at + q.length - 1] + 1;
  const span = sentenceSpan(clean, origStart);
  if (span.text.length <= limit) {
    const lead = span.start > 0;
    const tail = span.end < clean.length;
    const text = `${lead ? "…" : ""}${span.text}${tail ? "…" : ""}`;
    const shift = lead ? 1 : 0;
    return {
      text,
      markStart: shift + (origStart - span.start),
      markEnd: shift + (origEnd - span.start),
    };
  }
  return windowOf(span.text, origStart - span.start, origEnd - span.start, origStart - span.start, origEnd - span.start, limit);
}

function sentenceSpan(text: string, index: number): { text: string; start: number; end: number } {
  const sentences = splitSentences(text);
  let cursor = 0;
  for (const sentence of sentences) {
    const found = text.indexOf(sentence, cursor);
    const start = found === -1 ? cursor : found;
    const end = start + sentence.length;
    if (index >= start && index < end) return { text: sentence, start, end };
    cursor = end;
  }
  return { text, start: 0, end: text.length };
}

function windowOf(
  text: string,
  focusStart: number,
  focusEnd: number,
  markFrom: number,
  markTo: number,
  limit: number,
): Excerpt {
  if (text.length <= limit) {
    return { text, markStart: markFrom, markEnd: markTo };
  }
  const markLen = Math.max(0, focusEnd - focusStart);
  let start = Math.max(0, focusStart - Math.floor((limit - markLen) / 2));
  let end = Math.min(text.length, start + limit);
  start = Math.max(0, end - limit);
  if (start > 0) {
    const space = text.indexOf(" ", start);
    if (space !== -1 && space < focusStart) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > focusEnd) end = space;
  }
  const lead = start > 0;
  const tail = end < text.length;
  const slice = text.slice(start, end).trim();
  const trimLead = text.slice(start, end).length - text.slice(start, end).trimStart().length;
  const shownStart = start + trimLead;
  const out = `${lead ? "…" : ""}${slice}${tail ? "…" : ""}`;
  if (markFrom < 0 || markTo < shownStart || markFrom > shownStart + slice.length) {
    return { text: out, markStart: -1, markEnd: -1 };
  }
  const shift = (lead ? 1 : 0) - shownStart;
  return { text: out, markStart: markFrom + shift, markEnd: markTo + shift };
}
