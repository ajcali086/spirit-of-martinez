export type SearchGroupId =
  | "chapters"
  | "missions"
  | "plates"
  | "crew"
  | "timeline"
  | "sources";

export type SearchRecord = {
  group: SearchGroupId;
  /** Catalog order. Lower sorts first inside a rank. */
  order: number;
  /** Small-caps line. "Chapter 09". */
  type: string;
  title: string;
  /** Title, caption, kicker — outranks body. */
  titleText: string;
  body: string;
  href: string;
  /** Deep-link chip, without the pilcrow or hash mark. "9.1", "m-1". */
  chip?: string;
};

export type SearchHit = SearchRecord & {
  rank: 0 | 1;
};

export type SearchGroup = {
  id: SearchGroupId;
  label: string;
  total: number;
  hits: SearchHit[];
};
