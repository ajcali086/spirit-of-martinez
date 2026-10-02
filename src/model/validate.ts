/**
 * The model's checks. Each returns the problems it finds, as lines naming
 * the record; an empty list is a pass. model.test.ts runs every one.
 */
import { existsSync } from "node:fs";
import { chapters } from "@/data/chapters";
import { hasCaptainsChart, missions } from "@/data/missions";
import { photoList, photos } from "@/data/photos";
import { folders, records } from "./index";
import { SERIES } from "./types";

const repo = new URL("../../", import.meta.url);
const exists = (path: string) => existsSync(new URL(path, repo));
const iso = /^\d{4}-\d{2}-\d{2}$/;
const fail = (cond: boolean, msg: string) => (cond ? [] : [msg]);

/**
 * Figures the book shows that are not archive plates, so have no record,
 * each with the reason. A curator's call, not an omission.
 */
export const HELD_OUT: Record<string, string> = {
  locker:
    "A later arrangement of held objects, not a 1945 photograph; whether it is a record waits on the curator.",
};

const plateIds = new Set<string>(photoList.map((p) => p.id));

const MONTHS =
  "January February March April May June July August September October November December".split(
    " ",
  );
/** The ways a plate writes a date: `15 April 1944`, `April 15, 1944`, `April 1944`, `1944`. */
function dateForms(iso: string): string[] {
  const [y, m, d] = iso.split("-").map(Number);
  if (!m) return [String(y)];
  const month = MONTHS[m - 1];
  return d ? [`${d} ${month} ${y}`, `${month} ${d}, ${y}`] : [`${month} ${y}`];
}

export const checks: { name: string; run: () => string[] }[] = [
  {
    name: "each record has a file of its own, named for its ID",
    run: () =>
      Object.entries(folders.records).flatMap(([path, r]) =>
        fail(
          path === `./records/${(r as { id: string }).id}.json`,
          `${path}: named for another ID`,
        ),
      ),
  },
  {
    name: "record IDs are unique and well formed",
    run: () => {
      const seen = new Set<string>();
      return records.flatMap((r) => {
        const dup = seen.has(r.id);
        seen.add(r.id);
        return [
          ...fail(!dup, `${r.id}: duplicate`),
          ...fail(/^[a-z0-9-]+$/.test(r.id), `${r.id}: malformed`),
        ];
      });
    },
  },
  {
    name: "every plate resolves to one record of its ID, kind, title and credit, and every record's plate exists",
    run: () => [
      ...photoList.flatMap((p) => {
        const own = records.filter((r) => r.plate === p.id);
        if (own.length !== 1) return [`${p.id}: ${own.length} records`];
        const r = own[0];
        return [
          ...fail(r.id === p.id, `${p.id}: record ${r.id}`),
          ...fail(r.kind === p.kind, `${p.id}: kind ${r.kind}, plate ${p.kind}`),
          ...fail(r.title === p.title, `${p.id}: title differs from the plate's`),
          ...fail(r.credit === p.credit, `${p.id}: credit differs from the plate's`),
        ];
      }),
      ...records.flatMap((r) =>
        r.plate ? fail(plateIds.has(r.plate), `${r.id}: no plate ${r.plate}`) : [],
      ),
    ],
  },
  {
    name: "every figure the chapters show is a plate, or is held out with a reason",
    run: () => {
      const shown = new Set(
        chapters.flatMap((c) =>
          c.sections.flatMap((s) =>
            s.blocks.flatMap((b) => (b.type === "figure" ? [b.id as string] : [])),
          ),
        ),
      );
      return [
        ...[...shown].flatMap((id) =>
          fail(plateIds.has(id) || id in HELD_OUT, `${id}: shown, not a plate`),
        ),
        ...Object.keys(HELD_OUT).flatMap((id) => [
          ...fail(shown.has(id), `${id}: held out but not shown`),
          ...fail(!plateIds.has(id), `${id}: held out but a plate`),
          ...fail(id in photos, `${id}: held out but has no figure`),
        ]),
      ];
    },
  },
  {
    name: "held and status agree; held media exist; a not-held record names no file and no plate",
    run: () =>
      records.flatMap((r) => [
        ...fail(
          r.held === (r.status !== "not-held"),
          `${r.id}: held ${r.held}, status ${r.status}`,
        ),
        ...(r.held
          ? [
              ...fail(r.media.length > 0, `${r.id}: held, no media`),
              ...r.media.flatMap((m) => fail(exists(m), `${r.id}: ${m} missing`)),
            ]
          : [
              ...fail(r.media.length === 0, `${r.id}: not held, names media`),
              ...fail(!r.plate, `${r.id}: not held, has a plate`),
            ]),
      ]),
  },
  {
    name: "a plate's record holds the master its plate is drawn from",
    run: () =>
      photoList.flatMap((p) => {
        const r = records.find((x) => x.plate === p.id);
        return r
          ? fail(r.media.includes(`public${p.src}.jpg`), `${p.id}: media isn't public${p.src}.jpg`)
          : [];
      }),
  },
  {
    name: "every record states its capture provenance; none is a restoration",
    run: () =>
      records.flatMap((r) => {
        const c = r.capture_provenance as Record<string, string> | undefined;
        const stated =
          !!c &&
          ("unknown" in c
            ? !!c.unknown
            : ["device", "date", "collection", "source"].every((k) => !!c[k]));
        return [
          ...fail(stated, `${r.id}: capture provenance`),
          ...fail(r.restoration === null, `${r.id}: restoration`),
        ];
      }),
  },
  {
    name: "notes are dated, and a record that isn't verified says why",
    run: () =>
      records.flatMap((r) => [
        ...r.notes.flatMap((n) =>
          fail(iso.test(n.date) && !!n.note, `${r.id}: undated or empty note`),
        ),
        ...(r.status === "verified"
          ? []
          : fail(r.notes.length > 0, `${r.id}: ${r.status}, no note`)),
      ]),
  },
  {
    name: "each mission with a captains' chart has a chart record",
    run: () =>
      missions.filter(hasCaptainsChart).flatMap((m) =>
        fail(
          records.some((r) => r.id === `chart${m.number}`),
          `mission ${m.number}: no chart record`,
        ),
      ),
  },
  {
    name: "every record is filed in a series",
    run: () => {
      const known = new Set<string>(SERIES.map(([s]) => s));
      return records.flatMap((r) => fail(known.has(r.series), `${r.id}: series ${r.series}`));
    },
  },
  {
    name: "a paper's catalog entry quotes its plate, and its date is one the plate gives",
    run: () =>
      records.flatMap((r) => {
        const d = r.document;
        if (!d) return [];
        const p = r.plate ? photoList.find((x) => x.id === r.plate) : undefined;
        if (!p) return [`${r.id}: a catalog entry, but no plate to quote`];
        const text = [p.title, p.caption, p.alt, p.date ?? ""].join("\n");
        const quoted = [
          d.number,
          d.issued_by,
          d.issued_at,
          ...(d.serials ?? []),
          ...(d.signed_by ?? []),
        ];
        return [
          ...quoted.flatMap((q) =>
            q === undefined
              ? []
              : fail(!!q && text.includes(q), `${r.id}: "${q}" not on the plate`),
          ),
          ...(d.issued === undefined
            ? []
            : [
                ...fail(
                  /^\d{4}(-\d{2}(-\d{2})?)?$/.test(d.issued),
                  `${r.id}: issued ${d.issued} malformed`,
                ),
                ...fail(
                  dateForms(d.issued).some((f) => text.includes(f)),
                  `${r.id}: issued ${d.issued} not on the plate`,
                ),
              ]),
        ];
      }),
  },
  {
    name: "a detail names a whole record of the same series, which isn't itself a detail",
    run: () =>
      records.flatMap((r) => {
        if (!r.detail_of) return [];
        const whole = records.find((x) => x.id === r.detail_of);
        return whole
          ? [
              ...fail(whole.series === r.series, `${r.id}: series differs from ${whole.id}'s`),
              ...fail(!whole.detail_of, `${r.id}: ${whole.id} is itself a detail`),
            ]
          : [`${r.id}: detail of ${r.detail_of}, no such record`];
      }),
  },
];

/** Every problem the checks find. */
export function problems(): string[] {
  return checks.flatMap((c) => c.run().map((p) => `${c.name}: ${p}`));
}
