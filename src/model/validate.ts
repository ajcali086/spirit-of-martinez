/**
 * The model's checks. Each returns the problems it finds, as lines naming
 * the record; an empty list is a pass. model.test.ts runs every one.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { chapters, ingestedChapters } from "@/data/chapters";
import { correctionFiles, corrections, textKeys } from "@/data/corrections.ts";
import { chapterCues, splitSentences } from "@/data/cues";
import { hasCaptainsChart, missions } from "@/data/missions";
import { openQuestions as archiveQuestions } from "@/data/archive";
import { crew, crewForPhoto } from "@/data/crew";
import { discrepancies } from "@/data/discrepancies";
import { ingestedPhotos, photoList, photos } from "@/data/photos";
import PUBLISHED from "@/data/published-text.json" with { type: "json" };
import type { PhotoId } from "@/data/types";
import FROZEN from "./frozen.json" with { type: "json" };
import {
  entities,
  evidence,
  folders,
  heldBack,
  museum,
  passageGlobalId,
  questions,
  records,
  settled,
} from "./index";
import { ENTITY_KINDS, SERIES, type PassageRef } from "./types";

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

/** A passage's words: a paragraph by its ID, or a whole section by its own. */
function passageText(ref: PassageRef): string | undefined {
  const c = chapters.find((x) => x.slug === ref.chapter);
  for (const s of c?.sections ?? []) {
    const text = (b: (typeof s.blocks)[number]) =>
      "text" in b ? b.text : "body" in b ? b.body : "";
    if (s.id === ref.passage) return s.blocks.map(text).join("\n");
    const b = s.blocks.find((x) => x.type === "p" && x.id === ref.passage);
    if (b) return text(b);
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
  {
    name: "a record the book cites names a passage that exists",
    run: () =>
      records.flatMap((r) =>
        r.cited_at
          ? fail(
              passageText(r.cited_at) !== undefined,
              `${r.id}: no passage ${r.cited_at.chapter}#${r.cited_at.passage}`,
            )
          : [],
      ),
  },
  {
    name: "every evidence link has an ID, a type, a record and a dated curator",
    run: () => {
      const seen = new Set<string>();
      return evidence.flatMap((l) => {
        const r = records.find((x) => x.id === l.record);
        const out = [
          ...fail(/^ev-\d{3}$/.test(l.id), `${l.id}: malformed ID`),
          ...fail(!seen.has(l.id), `${l.id}: duplicate`),
          ...fail(
            ["supports", "contradicts", "qualifies"].includes(l.type),
            `${l.id}: type ${l.type}`,
          ),
          ...fail(!!r, `${l.id}: no record ${l.record}`),
          ...fail(!!l.curator && iso.test(l.date), `${l.id}: curator or date`),
          ...fail(!!l.says || !!l.note, `${l.id}: says nothing of what the record says`),
        ];
        seen.add(l.id);
        return out;
      });
    },
  },
  {
    name: "every claim is quoted verbatim from its passage or plate, and what a plated record says is on its plate",
    run: () =>
      evidence.flatMap((l) => {
        const c = l.claim as { quote: string; plate?: string; chapter?: string; passage?: string };
        const source = c.plate
          ? photoList.find((p) => p.id === c.plate)?.caption
          : passageText({ chapter: c.chapter ?? "", passage: c.passage ?? "" });
        const r = records.find((x) => x.id === l.record);
        return [
          ...fail(
            !!c.quote && !!source?.includes(c.quote),
            `${l.id}: claim not verbatim in its source`,
          ),
          ...(l.says
            ? fail(
                !!r?.plate && (plateText(r.plate) ?? "").includes(l.says),
                `${l.id}: "${l.says}" not on ${l.record}'s plate`,
              )
            : []),
        ];
      }),
  },
  {
    name: "every link is carried by a question or a settled entry, and every contradiction by a question",
    run: () =>
      evidence.flatMap((l) => {
        const inQuestion = questions.some((q) => q.evidence.includes(l.id));
        const inSettled = settled.some((s) => s.evidence.includes(l.id));
        return [
          ...fail(inQuestion || inSettled, `${l.id}: carried by nothing`),
          ...(l.type === "contradicts"
            ? fail(inQuestion, `${l.id}: a contradiction no question carries`)
            : []),
        ];
      }),
  },
  {
    name: "every open question is bounded: fields filled, sources, passages, entities and evidence resolve",
    run: () =>
      questions.flatMap((q) => [
        ...fail(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(q.id), `${q.id}: malformed ID`),
        ...fail(
          ["both-stand", "archive", "records"].includes(q.origin),
          `${q.id}: origin ${q.origin}`,
        ),
        ...fail(["open", "answered"].includes(q.status), `${q.id}: status ${q.status}`),
        ...(
          [
            "title",
            "what_we_know",
            "what_we_dont",
            "what_might_answer_it",
            "evidence_needed",
          ] as const
        ).flatMap((k) => fail(!!q[k], `${q.id}: ${k} empty`)),
        ...fail(!!q.curator && iso.test(q.date), `${q.id}: curator or date`),
        ...fail(q.last_known_source.length > 0, `${q.id}: no last known source`),
        ...q.last_known_source.flatMap((s) =>
          fail(
            records.some((r) => r.id === s),
            `${q.id}: no record ${s}`,
          ),
        ),
        ...q.passages.flatMap((p) =>
          fail(passageText(p) !== undefined, `${q.id}: no passage ${p.chapter}#${p.passage}`),
        ),
        ...q.entities.flatMap((e) =>
          fail(
            entities.some((x) => x.id === e),
            `${q.id}: no entity ${e}`,
          ),
        ),
        ...q.evidence.flatMap((e) =>
          fail(
            evidence.some((x) => x.id === e),
            `${q.id}: no evidence ${e}`,
          ),
        ),
        ...(q.status === "answered"
          ? fail(q.evidence.length > 0, `${q.id}: answered without evidence`)
          : []),
        ...(q.origin === "both-stand" ? fail(!!q.both_stand, `${q.id}: no register entry`) : []),
        ...(q.origin === "archive" ? fail(!!q.archive, `${q.id}: no archive question`) : []),
      ]),
  },
  {
    name: "every register entry is carried by a question or settled, never both; every archive question is carried",
    run: () => [
      ...discrepancies.flatMap((d) => {
        const asked = questions.some((q) => q.both_stand === d.id);
        const done = settled.some((s) => s.both_stand === d.id);
        return fail(
          asked !== done,
          `${d.id}: ${asked ? "both a question and settled" : "neither a question nor settled"}`,
        );
      }),
      ...questions.flatMap((q) =>
        q.both_stand
          ? fail(
              discrepancies.some((d) => d.id === q.both_stand),
              `${q.id}: no entry ${q.both_stand}`,
            )
          : [],
      ),
      ...archiveQuestions.flatMap((a) =>
        fail(
          questions.some((q) => q.archive === a.title),
          `${a.title}: no question`,
        ),
      ),
      ...questions.flatMap((q) =>
        q.archive
          ? fail(
              archiveQuestions.some((a) => a.title === q.archive),
              `${q.id}: no archive question "${q.archive}"`,
            )
          : [],
      ),
    ],
  },
  {
    name: "a settled entry is the curator's, dated and reasoned, and rests on evidence",
    run: () =>
      settled.flatMap((s) => [
        ...fail(
          discrepancies.some((d) => d.id === s.both_stand),
          `${s.both_stand}: no such entry`,
        ),
        ...fail(
          !!s.curator && iso.test(s.date) && !!s.rationale,
          `${s.both_stand}: curator, date, rationale`,
        ),
        ...fail(s.evidence.length > 0, `${s.both_stand}: no evidence`),
        ...s.evidence.flatMap((e) =>
          fail(
            evidence.some((x) => x.id === e),
            `${s.both_stand}: no evidence ${e}`,
          ),
        ),
      ]),
  },
  {
    name: "a held-back name's question exists",
    run: () =>
      heldBack.flatMap((h) =>
        h.question
          ? fail(
              questions.some((q) => q.id === h.question),
              `${h.label}: no question ${h.question}`,
            )
          : [],
      ),
  },
];

/**
 * The IDs the model freezes, kind by kind. A passage is `chapter#id`: a
 * paragraph's or a section's, as the site anchors it.
 */
export const FROZEN_KINDS = ["passages", "records", "entities", "questions", "evidence"] as const;
type FrozenKind = (typeof FROZEN_KINDS)[number];
type FrozenModel = { frozen_on: string; retired: string[] } & Record<FrozenKind, string[]>;
const frozen = FROZEN as FrozenModel;

export const inUse: Record<FrozenKind, string[]> = {
  passages: chapters.flatMap((c) =>
    c.sections.flatMap((s) => [
      `${c.slug}#${s.id}`,
      ...s.blocks.flatMap((b) => (b.type === "p" && b.id ? [`${c.slug}#${b.id}`] : [])),
    ]),
  ),
  records: records.map((r) => r.id),
  entities: entities.map((e) => e.id),
  questions: questions.map((q) => q.id),
  evidence: evidence.map((e) => e.id),
};

/** IDs in use that aren't frozen yet: new since the last freeze, frozen when it merges. */
export function provisionalIds(): string[] {
  return [
    ...FROZEN_KINDS.flatMap((kind) =>
      inUse[kind].filter((id) => !frozen[kind].includes(id)).map((id) => `${kind} ${id}`),
    ),
    ...[...ingestedText.keys()].filter((k) => !(k in published)).map((k) => `text ${k}`),
  ];
}

checks.push(
  {
    name: "the museum record is complete: text frozen by decision 0, IDs frozen on a date",
    run: () => [
      ...fail(museum.slug === "spirit-of-martinez", `slug ${museum.slug}`),
      ...fail(!!museum.title && !!museum.rights_holder, "title or rights holder"),
      ...fail(["pilot", "live", "archived"].includes(museum.status), `status ${museum.status}`),
      ...fail(museum.text_freeze === true, "text_freeze"),
      ...fail(iso.test(museum.id_freeze_date), "id_freeze_date"),
      ...fail(
        frozen.frozen_on === museum.id_freeze_date,
        "frozen.json and museum.json disagree on the date",
      ),
    ],
  },
  {
    name: "the model's IDs are frozen: every frozen ID is in use or retired, none reused, none used twice",
    run: () =>
      FROZEN_KINDS.flatMap((kind) => [
        ...inUse[kind].flatMap((id, i) =>
          fail(inUse[kind].indexOf(id) === i, `${kind} ${id} is used twice`),
        ),
        ...frozen[kind].flatMap((id) =>
          fail(
            inUse[kind].includes(id) || frozen.retired.includes(id),
            `${kind} ${id} was frozen and is gone; retire it instead`,
          ),
        ),
        ...inUse[kind].flatMap((id) =>
          fail(!frozen.retired.includes(id), `${kind} ${id} is retired`),
        ),
      ]),
  },
  {
    name: "every passage has one global ID",
    run: () => {
      const ids = inUse.passages.map((p) => {
        const [chapter, id] = p.split("#");
        return passageGlobalId(chapter, id);
      });
      return ids.flatMap((id, i) => fail(ids.indexOf(id) === i, `${id} is two passages`));
    },
  },
);

/** The book's text as ingested, by key: what the fingerprints were taken of. */
export const ingestedText = textKeys(ingestedChapters, ingestedPhotos);
/** The book's text as published: ingested, with applied corrections in place. */
const publishedText = textKeys(chapters, photos);
const published = PUBLISHED as Record<string, string>;
export const fingerprint = (text: string) =>
  createHash("sha256").update(text).digest("hex").slice(0, 16);

const chapterOfKey = (key: string) => key.split("#")[0];
const withReading = new Set(chapters.filter((c) => c.audio).map((c) => c.slug));
const applied = corrections.filter((c) => c.status === "applied");

/**
 * Applied corrections whose chapter has a recorded reading that still says
 * the old words. Not a failure: a list for the curator, who re-records the
 * reading and sets `audio_rerecorded`.
 */
export function audioToRerecord(): string[] {
  return applied
    .filter((c) => withReading.has(chapterOfKey(c.target)) && !c.audio_rerecorded)
    .map((c) => `${c.id}: re-record ${chapterOfKey(c.target)} (${c.target})`);
}

/** The keys a register entry turns on: its paragraph (or every block of its section), its plate. */
function entryKeys(d: (typeof discrepancies)[number]): string[] {
  const keys: string[] = [];
  if (d.paragraph) {
    const { slug, anchor } = d.paragraph;
    const c = ingestedChapters.find((x) => x.slug === slug);
    const section = c?.sections.find((s) => s.id === anchor);
    if (section)
      keys.push(
        ...[...ingestedText.keys()].filter(
          (k) =>
            k.startsWith(`${slug}#${anchor}/`) ||
            section.blocks.some((b) => b.type === "p" && k === `${slug}#${b.id}`),
        ),
      );
    else keys.push(`${slug}#${anchor}`);
  }
  if (d.plate) keys.push(`plate:${d.plate}`);
  return keys;
}

/** The key the readings use for a paragraph: its own ID, or by place for a mission anchor (as the site does). */
function cueKeys(chapter: (typeof chapters)[number]): Map<string, string> {
  const out = new Map<string, string>();
  for (const s of chapter.sections) {
    let i = 0;
    for (const b of s.blocks) {
      if (b.type !== "p") continue;
      const place = `${s.id}-p${i++}`;
      out.set(b.id?.startsWith("m-") ? place : (b.id ?? place), b.text);
    }
  }
  return out;
}

/** The paragraphs an applied, not yet re-recorded, correction has changed: their cues wait on the re-recording. */
const awaitingReading = new Set(
  applied
    .filter((c) => !c.audio_rerecorded)
    .map((c) => {
      const [slug, id] = c.target.split("#");
      const ch = chapters.find((x) => x.slug === slug);
      const s = ch?.sections.find((x) => x.blocks.some((b) => b.type === "p" && b.id === id));
      let i = -1;
      for (const b of s?.blocks ?? []) {
        if (b.type !== "p") continue;
        i++;
        if (b.id === id) return `${slug}#${id.startsWith("m-") ? `${s!.id}-p${i}` : id}`;
      }
      return "";
    }),
);

const momentsDir = new URL("src/generated/moments/cues/", repo);

checks.push(
  {
    name: "the published text changes only by correction: every fingerprinted passage and caption still reads as ingested",
    run: () =>
      Object.entries(published).flatMap(([key, hash]) => {
        const text = ingestedText.get(key);
        if (text === undefined) return [`${key}: gone; retire its ID, or propose a correction`];
        return fail(
          fingerprint(text) === hash,
          `${key}: edited in place; propose a correction instead`,
        );
      }),
  },
  {
    name: "each correction is filed under its ID, targets published text, says what, why, who and when, and is decided once it leaves the queue",
    run: () => [
      ...Object.entries(correctionFiles).flatMap(([path, c]) =>
        fail(path === `./corrections/${c.id}.json`, `${path}: named for ${c.id}`),
      ),
      ...corrections.flatMap((c) => [
        ...fail(/^c-[a-z0-9]+$/.test(c.id), `${c.id}: malformed ID`),
        ...fail(c.target in published, `${c.id}: ${c.target} is no published text`),
        ...fail(
          ["proposed", "accepted", "applied", "rejected"].includes(c.status),
          `${c.id}: status ${c.status}`,
        ),
        ...fail(!!c.proposed_text?.trim(), `${c.id}: no proposed text`),
        ...fail(c.proposed_text !== ingestedText.get(c.target), `${c.id}: changes nothing`),
        ...fail(!!c.reason?.trim(), `${c.id}: no reason`),
        ...fail(!!c.proposed_by?.trim(), `${c.id}: no proposer`),
        ...fail(iso.test(c.date ?? ""), `${c.id}: date ${c.date}`),
        ...(c.status === "proposed"
          ? []
          : [
              ...fail(!!c.decided_by?.trim(), `${c.id}: ${c.status}, but by nobody`),
              ...fail(iso.test(c.decided_on ?? ""), `${c.id}: ${c.status}, but undated`),
            ]),
      ]),
    ],
  },
  {
    name: "a correction to words a Both Stand entry turns on names the entry, and one that settles it leaves it answered or settled",
    run: () =>
      corrections.flatMap((c) => {
        const named = discrepancies.find((d) => d.id === c.discrepancy);
        return [
          ...(c.discrepancy ? fail(!!named, `${c.id}: no entry ${c.discrepancy}`) : []),
          ...(c.resolves_discrepancy
            ? fail(!!c.discrepancy, `${c.id}: resolves an entry it doesn't name`)
            : []),
          ...(c.status === "applied"
            ? [
                ...discrepancies.flatMap((d) =>
                  entryKeys(d).includes(c.target)
                    ? fail(
                        c.discrepancy === d.id,
                        `${c.id}: edits ${c.target}, which ${d.id} turns on, without naming it`,
                      )
                    : [],
                ),
                ...(named && c.resolves_discrepancy
                  ? fail(
                      settled.some((s) => s.both_stand === named.id) ||
                        questions.some((q) => q.both_stand === named.id && q.status === "answered"),
                      `${c.id}: resolves ${named.id}, whose question is still open`,
                    )
                  : []),
              ]
            : []),
        ];
      }),
  },
  {
    name: "the readings stay in step: every cue lands on a sentence of the published text, except where a correction awaits re-recording",
    run: () => {
      const out: string[] = [];
      for (const c of chapters.filter((x) => x.audio)) {
        const text = cueKeys(c);
        const sections = new Set(c.sections.map((s) => s.id));
        const waits = (pid: string) => awaitingReading.has(`${c.slug}#${pid}`);
        for (const cue of chapterCues[c.slug] ?? [])
          if (!text.has(cue.id) && !waits(cue.id)) out.push(`${c.slug}: paragraph cue ${cue.id}`);
        const file = new URL(`${c.slug}.json`, momentsDir);
        if (!existsSync(file)) continue;
        const m = JSON.parse(readFileSync(file, "utf8")) as {
          cues: { id: string }[];
          silent?: string[];
          weak?: string[];
        };
        for (const { id } of m.cues) {
          const sentence = /^(.*)-s(\d+)$/.exec(id);
          const section = /^sec-(.*)-(id|title|place)$/.exec(id);
          if (sentence) {
            const t = text.get(sentence[1]);
            if (waits(sentence[1])) continue;
            if (!t || Number(sentence[2]) >= splitSentences(t).length)
              out.push(`${c.slug}: sentence cue ${id}`);
          } else if (section) {
            if (!sections.has(section[1])) out.push(`${c.slug}: section cue ${id}`);
          } else if (!/^ch-(num|title|kicker)$/.test(id)) out.push(`${c.slug}: cue ${id}`);
        }
        for (const id of [...(m.silent ?? []), ...(m.weak ?? [])])
          if (!text.has(id.replace(/-s\d+$/, ""))) out.push(`${c.slug}: silent or weak ${id}`);
      }
      for (const f of readdirSync(momentsDir))
        if (!withReading.has(f.replace(/\.json$/, "")))
          out.push(`${f}: cues for a chapter with no reading`);
      return out;
    },
  },
  {
    name: "every passage the model quotes reads as published: a correction can't strand a claim",
    run: () =>
      [...publishedText.keys()].flatMap((k) =>
        fail(ingestedText.has(k), `${k}: published text with no ingested original`),
      ),
  },
);

/** Every problem the checks find. */
export function problems(): string[] {
  return checks.flatMap((c) => c.run().map((p) => `${c.name}: ${p}`));
}
