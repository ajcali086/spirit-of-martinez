import { photoList } from "@/data/photos";
import type { MuseumRecord } from "./types";

/**
 * The museum's model, as the site reads it: one JSON file per record in
 * records/, named for its ID. `validate.ts` checks it on every test run.
 */
export const MUSEUM_SLUG = "spirit-of-martinez";

/** The files of each folder, keyed by path ("./records/crew.json"), for the file-name check. */
export const folders = {
  records: import.meta.glob("./records/*.json", { eager: true, import: "default" }),
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

/** The global form of a local ID: passage, record, entity, question. */
export function globalId(kind: "p" | "r" | "e" | "q", id: string): string {
  return `${MUSEUM_SLUG}/${kind}/${id}`;
}
