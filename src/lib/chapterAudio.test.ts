import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import {
  AAC_QUERY,
  AAC_TYPE,
  aacSrc,
  pickChapterAudio,
  isAacSrc,
} from "./chapterAudio.ts";

const MP3 = "/audio/weight-of-small-machines.mp3?v=3";
const OTHER = "/audio/mission-one.mp3?v=3";

describe("pickChapterAudio", () => {
  it("picks AAC when the browser can play AAC-LC", () => {
    assert.equal(
      pickChapterAudio("weight-of-small-machines", MP3, () => "probably"),
      aacSrc("weight-of-small-machines"),
    );
    assert.equal(
      pickChapterAudio("what-came-back", OTHER, () => "maybe"),
      aacSrc("what-came-back"),
    );
  });

  it("keeps the MP3 when AAC is not playable", () => {
    assert.equal(
      pickChapterAudio("weight-of-small-machines", MP3, () => ""),
      MP3,
    );
  });

  it("asks for AAC-LC in MP4 at v=3", () => {
    assert.equal(AAC_TYPE, 'audio/mp4; codecs="mp4a.40.2"');
    assert.equal(AAC_QUERY, "v=3");
    assert.equal(
      aacSrc("mission-one"),
      "/audio/mission-one.m4a?v=3",
    );
  });
});

describe("isAacSrc", () => {
  it("recognizes the companion URL", () => {
    assert.equal(isAacSrc(aacSrc("weight-of-small-machines")), true);
    assert.equal(isAacSrc(MP3), false);
  });
});

describe("AAC companions on disk", () => {
  it("ships a duration-checked m4a next to every chapter MP3", () => {
    const chapterSrc = readFileSync(
      new URL("../data/chapters.ts", import.meta.url),
      "utf8",
    );
    const audios = [...chapterSrc.matchAll(/audio: "(\/audio\/[^"]+)"/g)].map(
      (m) => m[1],
    );
    assert.equal(audios.length, 15);
    const files = new Set(
      readdirSync(new URL("../../public/audio/", import.meta.url)),
    );
    for (const audio of audios) {
      assert.match(audio, /\.mp3\?v=3$/);
      const slug = audio.slice("/audio/".length, -".mp3?v=3".length);
      assert.ok(files.has(`${slug}.mp3`), `missing ${slug}.mp3`);
      assert.ok(files.has(`${slug}.m4a`), `missing ${slug}.m4a`);
    }
  });
});
