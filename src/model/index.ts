import { photoList } from "@/data/photos";
import EVIDENCE from "./evidence.json" with { type: "json" };
import HELD_BACK from "./held-back.json" with { type: "json" };
import SETTLED from "./settled.json" with { type: "json" };
import type { Entity, EvidenceLink, HeldBack, MuseumRecord, OpenQuestion, Settled } from "./types";

/**
 * The museum's model, as the site reads it: one JSON file per record in
 * records/, named for its ID, and per entity in entities/, named for its
 * slug. `validate.ts` checks it on every test run.
 */
export const MUSEUM_SLUG = "spirit-of-martinez";

/** The files of each folder, keyed by path ("./records/crew.json"), for the file-name check. */
export const folders = {
  records: import.meta.glob("./records/*.json", { eager: true, import: "default" }),
  entities: import.meta.glob("./entities/*.json", { eager: true, import: "default" }),
  questions: import.meta.glob("./questions/*.json", { eager: true, import: "default" }),
};

const plateRank = new Map(photoList.map((p, i) => [p.id as string, i]));

/*
 * Records in plate order, then those without a plate, by ID. The loader puts
 * back the empty lists a hand edit or a CMS save may leave out, so code
 * after this point can rely on them being there.
 */
export const records: MuseumRecord[] = (Object.values(folders.records) as MuseumRecord[])
  .map((r) => ({ ...r, media: r.media ?? [], notes: r.notes ?? [], restoration: null }))
  .sort(
    (a, b) =>
      (plateRank.get(a.plate ?? "") ?? Infinity) - (plateRank.get(b.plate ?? "") ?? Infinity) ||
      a.id.localeCompare(b.id, "en", { numeric: true }),
  );

export function recordById(id: string): MuseumRecord | undefined {
  return records.find((r) => r.id === id);
}

/** The record a plate shows. */
export function recordForPlate(plate: string): MuseumRecord | undefined {
  return records.find((r) => r.plate === plate);
}

const KIND_RANK: Record<Entity["kind"], number> = {
  person: 0,
  family: 1,
  place: 2,
  organization: 3,
  event: 4,
};

/** Entities by kind, missions in number order, the rest by label; empty lists put back. */
export const entities: Entity[] = (Object.values(folders.entities) as Entity[])
  .map((e) => ({
    ...e,
    aliases: (e.aliases ?? []).map((a) => ({ ...a, sources: a.sources ?? [] })),
    anchors: e.anchors ?? [],
    framing: e.framing ?? null,
    identity_assertions: (e.identity_assertions ?? []).map((a) => ({
      ...a,
      sources: a.sources ?? [],
    })),
    notes: e.notes ?? [],
  }))
  .sort(
    (a, b) =>
      KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
      (a.mission ?? 0) - (b.mission ?? 0) ||
      a.label.localeCompare(b.label),
  );

/** Names the plates use that aren't entities yet, each with the reason. */
export const heldBack = (HELD_BACK as HeldBack[]).map((h) => ({ ...h, sources: h.sources ?? [] }));

export function entityBySlug(slug: string): Entity | undefined {
  return entities.find((e) => e.slug === slug);
}

/** The entities a record anchors. */
export function entitiesForRecord(id: string): Entity[] {
  return entities.filter((e) => e.anchors.includes(id));
}

/** The mission entity for a mission number. */
export function missionEntity(number: number): Entity | undefined {
  return entities.find((e) => e.mission === number);
}

/** Claims linked to records, typed supports, contradicts or qualifies. One file, appended to. */
export const evidence = EVIDENCE as EvidenceLink[];

/** Left open: the register's entries, the archive's questions, and those the records raise. */
export const questions: OpenQuestion[] = (Object.values(folders.questions) as OpenQuestion[])
  .map((q) => ({
    ...q,
    last_known_source: q.last_known_source ?? [],
    passages: q.passages ?? [],
    entities: q.entities ?? [],
    evidence: q.evidence ?? [],
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

/** Register entries the curator judged settled, with the evidence that settles them. */
export const settled = (SETTLED as Settled[]).map((s) => ({ ...s, evidence: s.evidence ?? [] }));

export function evidenceById(id: string): EvidenceLink | undefined {
  return evidence.find((e) => e.id === id);
}

/** The questions an entity is part of. */
export function questionsForEntity(id: string): OpenQuestion[] {
  return questions.filter((q) => q.entities.includes(id));
}

/** The global form of a local ID: passage, record, entity, question. */
export function globalId(kind: "p" | "r" | "e" | "q", id: string): string {
  return `${MUSEUM_SLUG}/${kind}/${id}`;
}
