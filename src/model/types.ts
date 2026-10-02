/**
 * The Story & Record model, as this museum holds it. H1 retrofit, stage 1:
 * the records catalog.
 *
 * A plate (src/data/photos.ts) is what the book shows; a record is the
 * object itself, and what the museum can say about its copy. Every plate
 * has a record of the same ID. A record without a plate is one the museum
 * knows of but holds no copy of.
 *
 * IDs are local and provisional until the stage 4 freeze, when they take
 * the global form `spirit-of-martinez/r/{id}`.
 */

/** What the museum can say about its copy of a record. */
export type RecordStatus =
  /** The museum's copy is what the author published, from the collection it credits. */
  | "verified"
  /** Held, but where the copy came from isn't confirmed. Shown to visitors as such. */
  | "unverified"
  /** The record exists (the book or the archive names it) but the museum has no copy. */
  | "not-held";

export type RecordKind = "photograph" | "object";

/**
 * Where a record is filed. The first seven are the sections of an Army
 * personnel file, the file the 1973 fire at the National Personnel Records
 * Center destroyed: the museum's service papers, filed as that file kept
 * them. The rest are the museum's own.
 */
export const SERIES = [
  ["personnel", "Identity & qualification"],
  ["training", "Training"],
  ["orders", "Orders & assignments"],
  ["flight", "Flight records"],
  ["awards", "Awards & decorations"],
  ["supply", "Supply & property"],
  ["legal", "Legal & claims"],
  ["civil", "Civil aviation"],
  ["effects", "Personal effects"],
  ["family", "Family papers"],
  ["press", "Press"],
  ["photographs", "Photographs"],
  ["aircraft", "The aircraft"],
] as const;
export type Series = (typeof SERIES)[number][0];
/** The series that make up the service file. */
export const SERVICE_FILE: Series[] = [
  "personnel",
  "training",
  "orders",
  "flight",
  "awards",
  "supply",
  "legal",
];

export type DocumentType =
  | "general-order"
  | "special-order"
  | "form"
  | "memorandum"
  | "certificate"
  | "identification"
  | "will"
  | "letter";

/**
 * A paper's catalog entry, as an archive describes a military document:
 * what it is, its number, who issued it, where and when, the serial numbers
 * it carries, and who signed it. Every string is quoted from the plate (its
 * title, caption or alt text) and `issued` is a date the plate gives; a
 * field the plate doesn't state is left out, never inferred.
 */
export type DocumentEntry = {
  type: DocumentType;
  /** The form, order or record number, as the paper writes it ("GO 289", "A.A.F. Form No. 8"). */
  number?: string;
  issued_by?: string;
  issued_at?: string;
  /** ISO: a year, a month or a day (`1945-02-27`). */
  issued?: string;
  serials?: string[];
  signed_by?: string[];
};

/** How a held copy was captured. Unknowns are stated, not smoothed. */
export type CaptureProvenance =
  { device: string; date: string; collection: string; source: string } | { unknown: string };

/** A dated line in a record's history. A status changes only with one. */
export type RecordNote = { date: string; note: string };

export type MuseumRecord = {
  id: string;
  kind: RecordKind;
  /** The plate it is shown in: plates are the display unit, records the objects. */
  plate?: string;
  title: string;
  series: Series;
  /** For a paper: its catalog entry. */
  document?: DocumentEntry;
  /** A plate showing part of another record (a column of a form): that record's ID. */
  detail_of?: string;
  /** Where the plate's own credit says it comes from. */
  credit: string;
  rights_holder: string;
  held: boolean;
  status: RecordStatus;
  /** Repository paths of the files held: the master, not its derived sizes. Empty when not held. */
  media: string[];
  capture_provenance: CaptureProvenance;
  /** Only a restoration that redraws nothing is allowed; none here. */
  restoration: null;
  notes: RecordNote[];
};

/**
 * What an entity is. Spirit's own list: missions are events, first-class
 * here; an object (the aircraft, a jacket) stays a record, never an entity.
 */
export const ENTITY_KINDS = [
  ["person", "Person", "People"],
  ["family", "Family", "Families"],
  ["place", "Place", "Places"],
  ["organization", "Organization", "Organizations"],
  ["event", "Mission", "Missions"],
] as const;
export type EntityKind = (typeof ENTITY_KINDS)[number][0];

/** A name an entity also goes by, as the plates write it, and the records that write it so. */
export type Alias = { name: string; sources: string[] };

/**
 * A curator's identity decision, dated and attributed:
 * - merge: these names (aliases) are this entity;
 * - split: this entity is distinct from those (`with`), despite a shared name.
 * An unsettled identity is not asserted: the name is held back, and becomes
 * an open question.
 */
export type IdentityAssertion = {
  action: "merge" | "split";
  names?: string[];
  with?: string[];
  curator: string;
  date: string;
  rationale: string;
  sources: string[];
};

/** Where a place is, as the plate that locates it gives it. */
export type Geo = {
  lat: number;
  lng: number;
  precision: "address" | "city" | "approximate";
  layer: "hometown" | "training" | "london" | "tour" | "postwar";
};

export type Entity = {
  /** Identity: eight hex characters, never reused. */
  id: string;
  /** Display, for URLs; the file is named for it. */
  slug: string;
  kind: EntityKind;
  label: string;
  aliases: Alias[];
  /** Record IDs that anchor it, each naming it in its plate's own words. At least one. */
  anchors: string[];
  /** A crew member: their ID in src/data/crew.ts. */
  crew?: string;
  /** A mission: its number in src/data/missions.ts. */
  mission?: number;
  /** A place a plate locates: its plate's coordinates. */
  geo?: Geo;
  /** One line, curator-written and dated. Not written yet. */
  framing: null | { text: string; curator: string; date: string };
  identity_assertions: IdentityAssertion[];
  notes: RecordNote[];
};

/** A name the plates use that isn't an entity yet, with the reason. */
export type HeldBack = { label: string; kind: EntityKind; reason: string; sources: string[] };
