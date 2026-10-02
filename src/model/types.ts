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
