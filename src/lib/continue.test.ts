import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  chapterContinueRecord,
  clipPreview,
  findParagraph,
  parseContinue,
  plateContinueRecord,
  resolveContinue,
  sectionLine,
} from "./continue.ts";

describe("continue", () => {
  it("clips a preview on a word", () => {
    const text =
      "One detail in that account sits oddly against the photograph. The committee was disappointed to learn that the name consisted not of nose art.";
    const clipped = clipPreview(text, 90);
    assert.ok(clipped.endsWith("…"));
    assert.ok(clipped.length <= 91);
    assert.equal(clipped.includes("  "), false);
  });

  it("finds 11.3-p4 in Borrowed Aircraft", () => {
    const para = findParagraph("borrowed-aircraft", "11.3-p4");
    assert.ok(para);
    assert.equal(para?.sectionId, "11.3");
    assert.equal(para?.sectionTitle, "How the Name Got There");
    assert.match(para?.text ?? "", /plaque/);
  });

  it("builds a chapter record that resolves to the deep anchor", () => {
    const rec = chapterContinueRecord({
      slug: "borrowed-aircraft",
      paragraphId: "11.3-p4",
      sectionId: "11.3",
      sectionTitle: "How the Name Got There",
    });
    assert.ok(rec);
    assert.equal(rec?.url, "/chapters/borrowed-aircraft#11.3-p4");
    const resolved = resolveContinue(rec!);
    assert.equal(resolved?.slug, "borrowed-aircraft");
    assert.equal(resolved?.hash, "11.3-p4");
    assert.equal(resolved?.title, "Borrowed Aircraft");
    assert.equal(resolved?.section, "11.3 · How the Name Got There");
  });

  it("falls back to the chapter top when the hash is gone", () => {
    const rec = parseContinue(
      JSON.stringify({
        kind: "chapter",
        url: "/chapters/borrowed-aircraft#does-not-exist",
        chapterNum: 11,
        chapterTitle: "Borrowed Aircraft",
        section: "11.3 · How the Name Got There",
        preview: "One detail.",
        image: "/images/missions-banner.jpg",
        savedAt: 1,
      }),
    );
    const resolved = resolveContinue(rec!);
    assert.equal(resolved?.hash, "");
    assert.equal(resolved?.slug, "borrowed-aircraft");
  });

  it("hides a record whose chapter is gone", () => {
    const rec = parseContinue(
      JSON.stringify({
        kind: "chapter",
        url: "/chapters/not-a-chapter",
        chapterNum: 99,
        chapterTitle: "Gone",
        section: "",
        preview: "x",
        image: "/images/x.jpg",
        savedAt: 1,
      }),
    );
    assert.equal(resolveContinue(rec!), null);
  });

  it("rejects junk", () => {
    assert.equal(parseContinue(null), null);
    assert.equal(parseContinue("{"), null);
    assert.equal(parseContinue(JSON.stringify({ kind: "chapter" })), null);
  });

  it("builds a plate record from the catalog", () => {
    const rec = plateContinueRecord("idcard");
    assert.ok(rec);
    assert.equal(rec?.kind, "plate");
    assert.equal(rec?.url, "/archive/idcard");
    const resolved = resolveContinue(rec!);
    assert.equal(resolved?.slug, "idcard");
    assert.equal(resolved?.title, rec?.plateTitle);
  });

  it("formats a section line", () => {
    assert.equal(sectionLine("11.3", "How the Name Got There"), "11.3 · How the Name Got There");
  });
});
