import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { parse } from "yaml";
import { discrepancies } from "../../src/data/discrepancies.ts";
import {
  entities,
  evidence,
  heldBack,
  questions,
  records,
  settled,
} from "../../src/model/index.ts";
import { buildConfig, keyPage, optionSets } from "./cms.ts";

const source = readFileSync(new URL("../../src/cms/config.yml", import.meta.url), "utf8");
const sets = optionSets();
const offered = (set: string) => new Set(sets[set].map((o) => o.value));
const all = (set: string, ids: (string | undefined)[], what: string) => {
  const has = offered(set);
  for (const id of ids)
    if (id !== undefined) assert.ok(has.has(id), `${what}: ${id} not in ${set}`);
};

describe("the CMS's dropdowns", () => {
  it("offer every ID the model stores, so no saved value goes missing from its field", () => {
    all(
      "@records",
      records.flatMap((r) => [r.detail_of]),
      "detail_of",
    );
    all(
      "@plates",
      records.map((r) => r.plate),
      "plate",
    );
    all(
      "@series",
      records.map((r) => r.series),
      "series",
    );
    all(
      "@chapters",
      records.map((r) => r.cited_at?.chapter),
      "cited_at",
    );
    all(
      "@records",
      entities.flatMap((e) => [...e.anchors, ...e.aliases.flatMap((a) => a.sources)]),
      "entity",
    );
    all(
      "@records",
      entities.flatMap((e) => e.identity_assertions.flatMap((a) => a.sources)),
      "assertion",
    );
    all(
      "@records",
      questions.flatMap((q) => q.last_known_source),
      "question source",
    );
    all(
      "@entities",
      questions.flatMap((q) => q.entities),
      "question entity",
    );
    all(
      "@evidence",
      questions.flatMap((q) => q.evidence),
      "question evidence",
    );
    all(
      "@register",
      questions.map((q) => q.both_stand),
      "question entry",
    );
    all(
      "@chapters",
      questions.flatMap((q) => q.passages.map((p) => p.chapter)),
      "question passage",
    );
    all(
      "@records",
      evidence.map((l) => l.record),
      "evidence record",
    );
    all(
      "@chapters",
      evidence.map((l) => ("chapter" in l.claim ? l.claim.chapter : undefined)),
      "claim",
    );
    all(
      "@plates",
      evidence.map((l) => ("plate" in l.claim ? l.claim.plate : undefined)),
      "claim",
    );
    all(
      "@register",
      settled.map((s) => s.both_stand),
      "settled",
    );
    all(
      "@evidence",
      settled.flatMap((s) => s.evidence),
      "settled evidence",
    );
    all(
      "@records",
      heldBack.flatMap((h) => h.sources),
      "held back",
    );
    assert.equal(offered("@register").size, discrepancies.length);
  });

  it("show names, group them, and never offer an ID twice", () => {
    for (const [name, options] of Object.entries(sets)) {
      const values = options.map((o) => o.value);
      assert.equal(new Set(values).size, values.length, `${name} has duplicates`);
      for (const o of options)
        assert.ok(o.label && o.label !== o.value, `${name}: ${o.value} unlabelled`);
    }
    assert.ok(sets["@entities"][0].label.startsWith("Person · "));
    assert.ok(sets["@records"].some((o) => o.label.startsWith("Flight records · chart7 — ")));
    assert.ok(
      sets["@text"].some(
        (o) => o.value === "plate:chart7" && o.label.startsWith("Caption · chart7"),
      ),
    );
  });

  it("fills every set the config names, as a dropdown or, while empty, a text field", () => {
    const config = parse(buildConfig(source).replace(/^#.*\n/gm, ""));
    const names = config.collections.map((c: { name: string }) => c.name);
    assert.deepEqual(names, [
      "corrections",
      "records",
      "entities",
      "questions",
      "evidence",
      "settled",
      "held_back",
    ]);
    assert.doesNotMatch(JSON.stringify(config), /"@[a-z-]+"/);
    const target = config.collections[0].fields.find((f: { name: string }) => f.name === "target");
    assert.equal(target.options.length, sets["@text"].length);
    assert.equal(config.backend.branch, "main");
    assert.equal(config.logo.src, "/favicon.svg");
  });

  it("gives every field only keys the CMS knows (a comma in a flow mapping splits a label)", () => {
    const config = parse(buildConfig(source).replace(/^#.*\n/gm, ""));
    const known = new Set([
      "name",
      "label",
      "widget",
      "hint",
      "options",
      "default",
      "required",
      "pattern",
      "fields",
      "field",
      "multiple",
      "min",
      "collapsed",
      "summary",
      "type",
      "format",
      "value_type",
    ]);
    type Field = Record<string, unknown> & { fields?: Field[]; field?: Field };
    const walk = (fields: Field[], at: string): string[] =>
      fields.flatMap((f) => [
        ...Object.keys(f)
          .filter((k) => !known.has(k))
          .map((k) => `${at}.${String(f.name)}: ${k}`),
        ...(f.fields ? walk(f.fields, at) : []),
        ...(f.field ? walk([f.field], at) : []),
      ]);
    assert.deepEqual(
      config.collections.flatMap((c: { name: string; fields: Field[] }) => walk(c.fields, c.name)),
      [],
    );
  });

  it("refuses a set it doesn't know", () => {
    assert.throws(
      () =>
        buildConfig(
          'collections:\n  - fields:\n      - { name: x, widget: select, options: "@nope" }\n',
        ),
      /no option set @nope/,
    );
  });

  it("writes a key with every entity", () => {
    const page = keyPage();
    for (const e of entities) assert.ok(page.includes(`id="${e.id}"`), e.slug);
  });
});
