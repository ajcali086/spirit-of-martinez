import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { chapters } from "../data/chapters.ts";
import {
  cardSentences,
  endsWithTrigger,
  rawSegments,
  stitchSentences,
  type CardSentencePin,
} from "./cardSentences.ts";

const pinned = JSON.parse(
  readFileSync(new URL("../generated/card-sentences.json", import.meta.url), "utf8"),
) as CardSentencePin;

function paragraphs(): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      for (const block of section.blocks) {
        if (block.type !== "p" || !block.id) continue;
        out.push({ id: block.id, text: block.text });
      }
    }
  }
  return out;
}

describe("card sentences", () => {
  it("matches the pinned arrays", () => {
    assert.deepEqual(cardSentences(chapters), pinned);
  });

  it("leaves no non-final sentence ending on a trigger", () => {
    for (const [slug, page] of Object.entries(pinned)) {
      for (const [id, sentences] of Object.entries(page)) {
        for (let i = 0; i < sentences.length - 1; i++) {
          assert.equal(
            endsWithTrigger(sentences[i]),
            false,
            `${slug} ${id} sentence ${i} still ends on a trigger: ${sentences[i].slice(-24)}`,
          );
        }
      }
    }
  });

  // Vacuous. A bad split still concatenates, so this stays green when the
  // boundaries are wrong. The fragment test and the pin are the verdicts.
  it("rejoins raw Segmenter pieces to the paragraph", () => {
    for (const { id, text } of paragraphs()) {
      assert.equal(rawSegments(text).join(""), text, id);
      assert.equal(stitchSentences(rawSegments(text)).join(""), text, id);
    }
  });
});
