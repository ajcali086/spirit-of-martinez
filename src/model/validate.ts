/**
 * The model's checks. Each returns the problems it finds, as lines naming
 * the record; an empty list is a pass. model.test.ts runs every one.
 */
import { existsSync } from "node:fs";
import { chapters } from "@/data/chapters";
import { hasCaptainsChart, missions } from "@/data/missions";
import { crew, crewForPhoto } from "@/data/crew";
import { photoList, photos } from "@/data/photos";
import type { PhotoId } from "@/data/types";
import { entities, folders, heldBack, records } from "./index";
import { ENTITY_KINDS, SERIES } from "./types";

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

/** A plate's own words: title, caption, alt text and date. */
const plateText = (id: string) => {
  const p = photoList.find((x) => x.id === id);
  return p ? [p.title, p.caption, p.alt, p.date ?? ""].join("\n") : undefined;
};
/** Whether a text names `name` as written: whole words, and never as the start of a "Jr." name. */
const names = (text: string, name: string) =>
  new RegExp(
    `(?<![A-Za-z])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?! Jr\\.)(?![A-Za-z])`,
  ).test(text);

const NUMBER_WORDS =
  "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split(
    " ",
  );
const numberWord = (n: number) =>
  n <= 20 ? NUMBER_WORDS[n] : `twenty-${NUMBER_WORDS[n - 20]}`.replace("twenty-zero", "twenty");

/** Why an anchor anchors its entity, or undefined when nothing on the record says so. */
function anchorBasis(e: (typeof entities)[number], record: string): string | undefined {
  const m = e.mission === undefined ? undefined : missions.find((x) => x.number === e.mission);
  if (m && record === "crewrecord") return "the crew record lists every mission";
  if (m && record === `chart${m.number}`) return "its captains' chart";
  const text = plateText(record);
  if (!text) return undefined;
  const forms = [e.label, ...e.aliases.map((a) => a.name)];
  if (forms.some((f) => names(text, f))) return "named on the plate";
  const located = photos[record as PhotoId]?.place?.label;
  if (e.kind === "place" && located && forms.includes(located)) return "the plate locates it";
  if (e.crew && crewForPhoto(record as PhotoId).some((c) => c.id === e.crew))
    return "the site's crew plates assign it";
  if (m) {
    const n = m.number;
    const target = m.target.split(" — ")[0];
    const said = [
      `Mission ${n}`,
      `Mission #${n}`,
      `mission ${numberWord(n)}`,
      `Mission ${numberWord(n)}`,
    ];
    if (said.some((f) => names(text, f)) || names(text, target))
      return "the plate names the mission";
  }
  return undefined;
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
  {
    name: "each entity has a file of its own, named for its slug",
    run: () =>
      Object.entries(folders.entities).flatMap(([path, e]) =>
        fail(
          path === `./entities/${(e as { slug: string }).slug}.json`,
          `${path}: named for another slug`,
        ),
      ),
  },
  {
    name: "entity IDs are eight hex characters, unique; slugs are unique",
    run: () => {
      const ids = new Set<string>();
      const slugs = new Set<string>();
      return entities.flatMap((e) => {
        const out = [
          ...fail(/^[0-9a-f]{8}$/.test(e.id), `${e.slug}: id ${e.id}`),
          ...fail(!ids.has(e.id), `${e.slug}: id ${e.id} taken`),
          ...fail(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug), `${e.slug}: malformed slug`),
          ...fail(!slugs.has(e.slug), `${e.slug}: slug taken`),
        ];
        ids.add(e.id);
        slugs.add(e.slug);
        return out;
      });
    },
  },
  {
    name: "an entity's kind is one of the museum's, and only a mission is an event",
    run: () => {
      const kinds = new Set<string>(ENTITY_KINDS.map(([k]) => k));
      return entities.flatMap((e) => [
        ...fail(kinds.has(e.kind), `${e.slug}: kind ${e.kind}`),
        ...fail((e.kind === "event") === (e.mission !== undefined), `${e.slug}: event and mission`),
        ...fail(!e.crew || e.kind === "person", `${e.slug}: crew on a ${e.kind}`),
        ...fail(!e.geo || e.kind === "place", `${e.slug}: geo on a ${e.kind}`),
      ]);
    },
  },
  {
    name: "every entity has at least one anchoring record, and each anchor names it in the record's own words",
    run: () =>
      entities.flatMap((e) => [
        ...fail(e.anchors.length > 0, `${e.slug}: no anchor`),
        ...e.anchors.flatMap((a) =>
          !records.some((r) => r.id === a)
            ? [`${e.slug}: anchor ${a}, no such record`]
            : fail(!!anchorBasis(e, a), `${e.slug}: ${a} doesn't name it`),
        ),
      ]),
  },
  {
    name: "an alias is written as given on every one of its sources, each an anchor",
    run: () =>
      entities.flatMap((e) =>
        e.aliases.flatMap((al) => [
          ...fail(al.sources.length > 0, `${e.slug}: "${al.name}" has no source`),
          ...al.sources.flatMap((s) => [
            ...fail(e.anchors.includes(s), `${e.slug}: "${al.name}" source ${s} isn't an anchor`),
            ...fail(names(plateText(s) ?? "", al.name), `${e.slug}: "${al.name}" not on ${s}`),
          ]),
        ]),
      ),
  },
  {
    name: "each of the nine crew is one person, and each of the 31 missions one event",
    run: () => [
      ...crew.flatMap((c) => {
        const n = entities.filter((e) => e.crew === c.id).length;
        return fail(n === 1, `${c.id}: ${n} entities`);
      }),
      ...entities.flatMap((e) =>
        e.crew
          ? fail(
              crew.some((c) => c.id === e.crew),
              `${e.slug}: no crew ${e.crew}`,
            )
          : [],
      ),
      ...missions.flatMap((m) => {
        const n = entities.filter((e) => e.mission === m.number).length;
        return fail(n === 1, `mission ${m.number}: ${n} entities`);
      }),
      ...entities.flatMap((e) =>
        e.mission === undefined
          ? []
          : fail(
              missions.some((m) => m.number === e.mission),
              `${e.slug}: no mission ${e.mission}`,
            ),
      ),
    ],
  },
  {
    name: "every place a plate locates is a place entity it anchors, at the plate's coordinates",
    run: () => [
      ...photoList.flatMap((p) => {
        if (!p.place) return [];
        const pl = p.place;
        const here = entities.filter(
          (e) =>
            e.kind === "place" &&
            e.anchors.includes(p.id) &&
            e.geo?.lat === pl.lat &&
            e.geo.lng === pl.lng,
        );
        // The same place may be pinned a few metres apart on two plates: within ~1 km is one place.
        const near = entities.filter(
          (e) =>
            e.kind === "place" &&
            e.anchors.includes(p.id) &&
            !!e.geo &&
            Math.abs(e.geo.lat - pl.lat) < 0.01 &&
            Math.abs(e.geo.lng - pl.lng) < 0.01 &&
            e.geo.precision === pl.precision &&
            e.geo.layer === pl.layer,
        );
        return fail(here.length + near.length > 0, `${p.id}: ${pl.label} is no place entity`);
      }),
      ...entities.flatMap((e) =>
        e.geo
          ? fail(
              e.anchors.some((a) => photos[a as PhotoId]?.place),
              `${e.slug}: has coordinates, but no anchor locates it`,
            )
          : [],
      ),
    ],
  },
  {
    name: "identity assertions are dated, attributed, reasoned and sourced; their names are aliases",
    run: () =>
      entities.flatMap((e) =>
        e.identity_assertions.flatMap((a, i) => {
          const at = `${e.slug} assertion ${i + 1}`;
          return [
            ...fail(["merge", "split"].includes(a.action), `${at}: action ${a.action}`),
            ...fail(
              !!a.curator && iso.test(a.date) && !!a.rationale,
              `${at}: curator, date, rationale`,
            ),
            ...fail(a.sources.length > 0, `${at}: no source`),
            ...a.sources.flatMap((s) =>
              fail(e.anchors.includes(s), `${at}: source ${s} isn't an anchor`),
            ),
            ...(a.names ?? []).flatMap((n) =>
              fail(
                e.aliases.some((al) => al.name === n),
                `${at}: ${n} isn't an alias`,
              ),
            ),
          ];
        }),
      ),
  },
  {
    name: "entity notes are dated; a held-back name gives its reason and its records, and isn't an entity",
    run: () => [
      ...entities.flatMap((e) =>
        e.notes.flatMap((n) =>
          fail(iso.test(n.date) && !!n.note, `${e.slug}: undated or empty note`),
        ),
      ),
      ...heldBack.flatMap((h) => [
        ...fail(!!h.reason, `${h.label}: no reason`),
        ...fail(h.sources.length > 0, `${h.label}: no source`),
        ...h.sources.flatMap((s) =>
          fail(
            records.some((r) => r.id === s),
            `${h.label}: no record ${s}`,
          ),
        ),
        ...fail(!entities.some((e) => e.label === h.label), `${h.label}: is an entity`),
      ]),
    ],
  },
];

/** Every problem the checks find. */
export function problems(): string[] {
  return checks.flatMap((c) => c.run().map((p) => `${c.name}: ${p}`));
}
