import { entities } from "@/model/index";
import { isCrewPlate } from "./crew";
import { discrepancies, type Discrepancy } from "./discrepancies";
import { missions } from "./missions";
import { photoList, photos } from "./photos";
import type { Mission, PhotoId } from "./types";

/**
 * "Also": doors derived across what the museum already holds, rendered on
 * pages that exist. Nothing here is authored. The connections come from the
 * model's entities (src/model/entities/), each anchored only where a plate's
 * own words name it:
 *
 * - a mission door where the plate names the mission (its number, its
 *   target, or its chart), never a caption's passing mention: the same bar
 *   FIGURE_MISSION set;
 * - a related plate where two plates name the same person; none shared, no
 *   line (the Red Carpenter rule);
 * - a Both Stand door where the register's entry points at the plate or the
 *   mission.
 */

const plateIndex = new Map(photoList.map((p, i) => [p.id as string, i]));
const isPlate = (id: string): id is PhotoId => plateIndex.has(id);

/** The missions a plate's own words tie it to, in mission order. */
export function missionsForPhoto(id: PhotoId): number[] {
  return entities
    .filter((e) => e.kind === "event" && e.mission !== undefined && e.anchors.includes(id))
    .map((e) => e.mission as number)
    .sort((a, b) => a - b);
}

/** The plates tied to a mission, in catalog order: the exact inverse of missionsForPhoto. */
export function photosForMission(n: number): PhotoId[] {
  const e = entities.find((x) => x.kind === "event" && x.mission === n);
  return (e?.anchors ?? [])
    .filter(isPlate)
    .sort((a, b) => (plateIndex.get(a) ?? 0) - (plateIndex.get(b) ?? 0));
}

export function missionForNumber(n: number): Mission | undefined {
  return missions.find((m) => m.number === n);
}

/** At most this many related plates per person. */
export const RELATED_CAP = 3;

/**
 * Plates that name a person this plate names, per person, nearest in the
 * catalog first (ties to the earlier plate), at most RELATED_CAP each. Not
 * the plate itself, and not a whole-crew plate: more of the whole crew is
 * noise. `via` is the person's label, as the model has it.
 */
export function relatedPhotos(id: PhotoId): { id: PhotoId; via: string }[] {
  const here = plateIndex.get(id);
  if (here === undefined) return [];
  return entities
    .filter((e) => e.kind === "person" && e.anchors.includes(id))
    .flatMap((e) =>
      e.anchors
        .filter((a): a is PhotoId => isPlate(a) && a !== id && !isCrewPlate(a))
        .sort((a, b) => {
          const da = Math.abs((plateIndex.get(a) ?? 0) - here);
          const db = Math.abs((plateIndex.get(b) ?? 0) - here);
          return da - db || (plateIndex.get(a) ?? 0) - (plateIndex.get(b) ?? 0);
        })
        .slice(0, RELATED_CAP)
        .map((p) => ({ id: p, via: e.label })),
    );
}

/** The related plates grouped by person, in the order the people first appear. */
export function relatedByPerson(id: PhotoId): { via: string; photos: PhotoId[] }[] {
  const groups = new Map<string, PhotoId[]>();
  for (const r of relatedPhotos(id)) groups.set(r.via, [...(groups.get(r.via) ?? []), r.id]);
  return [...groups].map(([via, ids]) => ({ via, photos: ids }));
}

/** Register entries that point at this plate. */
export function entriesForPhoto(id: PhotoId): Discrepancy[] {
  return discrepancies.filter((d) => d.plate === id);
}

/** Register entries that point at this mission. */
export function entriesForMission(n: number): Discrepancy[] {
  return discrepancies.filter((d) => d.mission === n);
}

/** A plate's title, for a door. */
export function plateTitle(id: PhotoId): string {
  return photos[id].title;
}
