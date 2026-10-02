import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import {
  AAC_QUERY,
  AAC_TYPE,
  AUDIO_ORIGIN,
  aacSrc,
  audioUrl,
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
      audioUrl(MP3),
    );
  });

  it("uses the chapter's own cache query on the AAC companion", () => {
    const next = "/audio/weight-of-small-machines.mp3?v=4";
    assert.equal(
      pickChapterAudio("weight-of-small-machines", next, () => "probably"),
      `${AUDIO_ORIGIN}/weight-of-small-machines.m4a?v=4`,
    );
  });

  it("asks for AAC-LC in MP4 at v=3", () => {
    assert.equal(AAC_TYPE, 'audio/mp4; codecs="mp4a.40.2"');
    assert.equal(AAC_QUERY, "v=3");
    assert.equal(aacSrc("mission-one"), `${AUDIO_ORIGIN}/mission-one.m4a?v=3`);
  });

  it("leaves the filename alone and keeps the query", () => {
    assert.equal(audioUrl("/audio/skywatch-silence.mp3"), `${AUDIO_ORIGIN}/skywatch-silence.mp3`);
    assert.equal(audioUrl(MP3), `${AUDIO_ORIGIN}/weight-of-small-machines.mp3?v=3`);
  });
});

describe("isAacSrc", () => {
  it("recognizes the companion URL", () => {
    assert.equal(isAacSrc(aacSrc("weight-of-small-machines")), true);
    assert.equal(isAacSrc(MP3), false);
  });
});

// The readings live in the spirit-audio Blob store; public/audio/ holds only
// a reading on its way there (scripts/upload-audio.mjs), usually nothing.
describe("AAC companions", () => {
  const chapterSrc = readFileSync(new URL("../data/chapters.ts", import.meta.url), "utf8");
  const audios = [...chapterSrc.matchAll(/audio: "(\/audio\/[^"]+)"/g)].map((m) => m[1]);
  const slugs = audios.map((a) => a.replace(/^\/audio\//, "").replace(/\.mp3\?v=\d+$/, ""));
  const files = readdirSync(new URL("../../public/audio/", import.meta.url)).filter(
    (f) => !f.startsWith("."),
  );

  it("gives every chapter a versioned MP3, which the store pairs with its m4a", () => {
    assert.equal(audios.length, 15);
    for (const audio of audios) assert.match(audio, /\.mp3\?v=\d+$/);
  });

  it("uploads a chapter's MP3 only with its m4a beside it, and only under a name the site plays", () => {
    const names = new Set(files);
    for (const f of files) {
      const slug = f.replace(/\.(mp3|m4a)$/, "");
      assert.ok(
        slugs.includes(slug) || f === "skywatch-silence.mp3",
        `${f}: no chapter or track plays it`,
      );
      if (f.endsWith(".mp3") && slugs.includes(slug))
        assert.ok(names.has(`${slug}.m4a`), `${f} without ${slug}.m4a`);
    }
  });
});
