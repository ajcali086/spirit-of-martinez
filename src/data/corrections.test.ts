import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { describe, it } from "node:test";
import { ingestedChapters } from "./chapters.ts";
import { ingestedPhotos } from "./photos.ts";

/**
 * The corrections queue, end to end: each case files a correction (or edits
 * the ingested text in place), runs the model check in a fresh process, so
 * the book is re-read with the correction applied, and puts the files back.
 * It writes into the repo, so package.json runs it on its own, after the
 * other tests.
 */
const repo = new URL("../../", import.meta.url);

function check(): { ok: boolean; out: string } {
  try {
    const out = execFileSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--import",
        "./scripts/test-register.mjs",
        "scripts/check-model.ts",
      ],
      { cwd: repo, encoding: "utf8", stdio: "pipe" },
    );
    return { ok: true, out };
  } catch (e) {
    const err = e as { stdout: string; stderr: string };
    return { ok: false, out: err.stdout + err.stderr };
  }
}

/** Writes each file (text, or an object as JSON), runs `run`, and restores or removes it. */
function withFiles(files: Record<string, string | object>, run: () => void) {
  const paths = Object.keys(files).map((p) => new URL(p, repo));
  const originals = paths.map((p) => {
    try {
      return readFileSync(p, "utf8");
    } catch {
      return null;
    }
  });
  try {
    Object.values(files).forEach((body, i) =>
      writeFileSync(paths[i], typeof body === "string" ? body : JSON.stringify(body, null, 2)),
    );
    run();
  } finally {
    paths.forEach((p, i) =>
      originals[i] === null ? rmSync(p) : writeFileSync(p, originals[i] as string),
    );
  }
}

const paragraph = (slug: string, id: string) => {
  for (const s of ingestedChapters.find((c) => c.slug === slug)!.sections)
    for (const b of s.blocks) if (b.type === "p" && b.id === id) return b.text;
  throw new Error(`${slug}#${id}`);
};

/** A paragraph of the Utrecht chapter, which has a reading, that nothing in the model quotes. */
const UTRECHT = "utrecht#12.3-p1";
const utrecht = paragraph("utrecht", "12.3-p1");
/** A paragraph a Both Stand entry turns on (sam-death), with a claim quoted from it. */
const SAM = "what-came-back#13.3-p2";
const sam = paragraph("what-came-back", "13.3-p2");

const file = (id: string) => `src/data/corrections/${id}.json`;
const applied = {
  reason: "test",
  proposed_by: "tester",
  date: "2026-10-02",
  status: "applied",
  decided_by: "curator",
  decided_on: "2026-10-02",
};

describe("corrections, end to end", () => {
  it("refuses the ingested text edited in place", () => {
    const chapters = readFileSync(new URL("src/data/chapters.ts", repo), "utf8");
    const edited = chapters.replace("Air Commodore Andrew Geddes", "Air Commodore A. Geddes");
    assert.notEqual(edited, chapters);
    withFiles({ "src/data/chapters.ts": edited }, () => {
      const r = check();
      assert.equal(r.ok, false);
      assert.match(r.out, /utrecht#12\.3-p1: edited in place; propose a correction instead/);
    });
  });

  it("applies a correction, and lists the chapter's reading to re-record until it is", () => {
    const fixed = utrecht.replace(
      "General Eisenhower, sympathetic,",
      "General Eisenhower, though sympathetic,",
    );
    assert.notEqual(fixed, utrecht);
    const c = { id: "c-test1", target: UTRECHT, proposed_text: fixed, ...applied };
    withFiles({ [file(c.id)]: c }, () => {
      const r = check();
      assert.equal(r.ok, true, r.out);
      assert.match(r.out, /c-test1: re-record utrecht/);
    });
    withFiles({ [file(c.id)]: { ...c, audio_rerecorded: true } }, () => {
      const r = check();
      assert.equal(r.ok, true, r.out);
      assert.doesNotMatch(r.out, /re-record/);
    });
  });

  it("holds the cues to the corrected text once the reading is re-recorded", () => {
    const shorter = utrecht.split(". ")[0] + ".";
    const c = {
      id: "c-test2",
      target: UTRECHT,
      proposed_text: shorter,
      ...applied,
      audio_rerecorded: true,
    };
    withFiles({ [file(c.id)]: c }, () => {
      const r = check();
      assert.equal(r.ok, false);
      assert.match(r.out, /utrecht: sentence cue 12\.3-p1-s1/);
    });
    withFiles({ [file(c.id)]: { ...c, audio_rerecorded: false } }, () => {
      assert.equal(check().ok, true);
    });
  });

  it("refuses a correction to words a Both Stand entry turns on unless it names the entry", () => {
    const fixed = sam.replace("nine years after the fact", "nine years later");
    assert.notEqual(fixed, sam);
    const c = {
      id: "c-test3",
      target: SAM,
      proposed_text: fixed,
      ...applied,
      audio_rerecorded: true,
    };
    withFiles({ [file(c.id)]: c }, () => {
      const r = check();
      assert.equal(r.ok, false);
      assert.match(r.out, /c-test3: edits what-came-back#13\.3-p2, which sam-death turns on/);
    });
    withFiles({ [file(c.id)]: { ...c, discrepancy: "sam-death" } }, () => {
      assert.equal(check().ok, true);
    });
  });

  it("refuses a correction that strands evidence quoting the old words", () => {
    const caption = ingestedPhotos.chart7.caption;
    const fixed = caption.replace("Hand-dated 23 Feb. 1945", "Hand-dated 24 Feb. 1945");
    assert.notEqual(fixed, caption);
    const c = {
      id: "c-test4",
      target: "plate:chart7",
      proposed_text: fixed,
      ...applied,
      discrepancy: "chart-date",
    };
    withFiles({ [file(c.id)]: c }, () => {
      const r = check();
      assert.equal(r.ok, false);
      assert.match(
        r.out,
        /ev-002: "Hand-dated 23 Feb\. 1945 and numbered Mission #7\." not on chart7's plate/,
      );
    });
  });

  it("leaves a proposed correction out of the text", () => {
    const c = {
      id: "c-test5",
      target: UTRECHT,
      proposed_text: "Anything at all.",
      reason: "test",
      proposed_by: "tester",
      date: "2026-10-02",
      status: "proposed",
    };
    withFiles({ [file(c.id)]: c }, () => {
      const r = check();
      assert.equal(r.ok, true, r.out);
      assert.doesNotMatch(r.out, /re-record/);
    });
  });
});
