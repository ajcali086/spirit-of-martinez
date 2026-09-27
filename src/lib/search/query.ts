import { normalize } from "./normalize.ts";
import type { SearchGroup, SearchGroupId, SearchHit, SearchRecord } from "./types.ts";

export const GROUP_ORDER: { id: SearchGroupId; label: string }[] = [
  { id: "chapters", label: "Chapters" },
  { id: "missions", label: "Missions" },
  { id: "plates", label: "Plates" },
  { id: "crew", label: "Crew" },
  { id: "timeline", label: "Timeline" },
  { id: "sources", label: "Sources" },
];

export const PER_GROUP = 5;
export const MIN_QUERY = 2;

export function searchRecords(records: SearchRecord[], raw: string): SearchGroup[] {
  const q = normalize(raw);
  if (q.length < MIN_QUERY) return [];
  const hits: SearchHit[] = [];
  for (const record of records) {
    const titleHit = normalize(record.titleText).includes(q);
    const bodyHit = normalize(record.body).includes(q);
    if (!titleHit && !bodyHit) continue;
    hits.push({ ...record, rank: titleHit ? 0 : 1 });
  }
  const groups: SearchGroup[] = [];
  for (const group of GROUP_ORDER) {
    const mine = hits
      .filter((h) => h.group === group.id)
      .sort((a, b) => a.rank - b.rank || a.order - b.order);
    if (!mine.length) continue;
    groups.push({
      id: group.id,
      label: group.label,
      total: mine.length,
      hits: mine.slice(0, PER_GROUP),
    });
  }
  return groups;
}

export function flattenHits(groups: SearchGroup[]): SearchHit[] {
  return groups.flatMap((g) => g.hits);
}

export function resultCount(groups: SearchGroup[]): number {
  return groups.reduce((n, g) => n + g.total, 0);
}
