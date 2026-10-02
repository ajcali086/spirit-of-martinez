import type { ArchivePhoto } from "./photos";
import type { Block, Chapter, PhotoId } from "./types";

/**
 * Corrections to the book's published text: the only way it changes, by the
 * author's decision 0 (src/model/museum.json, text_freeze).
 *
 * chapters.ts and the plate captions in photos.ts are the text as ingested,
 * and are never edited; src/data/published-text.json holds a fingerprint of
 * every piece of it, and the model check refuses an edit. A correction is
 * proposed, accepted or rejected by the curator, and applied: an applied
 * correction replaces its passage's text (or a plate's caption) when the
 * book is read, so the change is a record with a reason, a date and who
 * made it, and the ingested words stay where they were.
 *
 * The chapter readings are recorded audio, with no script: an applied
 * correction to a chapter with a reading lists that reading for
 * re-recording (src/model/validate.ts, audioToRerecord) until
 * `audio_rerecorded` says it's done.
 */
export type Correction = {
  /** Frozen: "c-" and a short code. */
  id: string;
  /** A text key (textKeys): a passage "chapter#id", a block "chapter#section/quote-0", or "plate:id". */
  target: string;
  /** The passage, block or caption as it should read, whole. */
  proposed_text: string;
  reason: string;
  /** Who proposed it, and when (YYYY-MM-DD). */
  proposed_by: string;
  date: string;
  status: "proposed" | "accepted" | "applied" | "rejected";
  /** Who accepted, applied or rejected it, and when: required once it leaves "proposed". */
  decided_by?: string;
  decided_on?: string;
  /** A Both Stand entry (src/data/discrepancies.ts) whose passage or plate it touches. */
  discrepancy?: string;
  /** Whether it settles that entry; its question must then be answered, or the entry settled. */
  resolves_discrepancy?: boolean;
  /** Set once the chapter's reading has been re-recorded with the corrected words. */
  audio_rerecorded?: boolean;
  /** The curator's, never shown to readers. */
  curator_note?: string;
};

/** The correction files, keyed by path ("./corrections/c-1a2b.json"), for the file-name check. */
export const correctionFiles = import.meta.glob("./corrections/*.json", {
  eager: true,
  import: "default",
}) as Record<string, Correction>;

export const corrections: Correction[] = Object.values(correctionFiles).sort(
  (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
);

/** The applied correction each passage, block or caption reads by: the latest, if several. */
export const appliedCorrections = new Map(
  corrections.filter((c) => c.status === "applied").map((c) => [c.target, c]),
);

/** A block's text and its key within the section, if it carries text. */
function blockKey(
  chapter: string,
  section: string,
  b: Block,
  seen: Map<string, number>,
): [string, string] | undefined {
  if (b.type === "p") return b.id ? [`${chapter}#${b.id}`, b.text] : undefined;
  const text = b.type === "figure" ? b.caption : b.type === "artifact" ? b.body : b.text;
  if (text === undefined) return undefined;
  const n = seen.get(b.type) ?? 0;
  seen.set(b.type, n + 1);
  return [`${chapter}#${section}/${b.type}-${n}`, text];
}

/**
 * Every piece of published text, by key: each paragraph by its ID, each
 * other block that carries words by its section and place, each plate's
 * caption.
 */
export function textKeys(
  chapters: readonly Chapter[],
  photos: Record<string, ArchivePhoto>,
): Map<string, string> {
  const out = new Map<string, string>();
  for (const c of chapters)
    for (const s of c.sections) {
      const seen = new Map<string, number>();
      for (const b of s.blocks) {
        const kt = blockKey(c.slug, s.id, b, seen);
        if (kt) out.set(kt[0], kt[1]);
      }
    }
  for (const [id, p] of Object.entries(photos)) out.set(`plate:${id}`, p.caption);
  return out;
}

/** The chapters as published: each block with its applied correction, if it has one. */
export function withCorrections(chapters: Chapter[]): Chapter[] {
  if (!appliedCorrections.size) return chapters;
  return chapters.map((c) => ({
    ...c,
    sections: c.sections.map((s) => {
      const seen = new Map<string, number>();
      return {
        ...s,
        blocks: s.blocks.map((b) => {
          const key = blockKey(c.slug, s.id, b, seen)?.[0];
          const fix = key && appliedCorrections.get(key)?.proposed_text;
          if (!fix) return b;
          if (b.type === "figure") return { ...b, caption: fix };
          if (b.type === "artifact") return { ...b, body: fix };
          return { ...b, text: fix };
        }),
      };
    }),
  }));
}

/** The plates as published: each caption with its applied correction, if it has one. */
export function withCaptionCorrections(
  photos: Record<PhotoId, ArchivePhoto>,
): Record<PhotoId, ArchivePhoto> {
  if (!appliedCorrections.size) return photos;
  return Object.fromEntries(
    Object.entries(photos).map(([id, p]) => {
      const fix = appliedCorrections.get(`plate:${id}`)?.proposed_text;
      return [id, fix ? { ...p, caption: fix } : p];
    }),
  ) as Record<PhotoId, ArchivePhoto>;
}
