import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AAC_TYPE,
  aacSrc,
  pickChapterAudio,
  isAacSrc,
} from "./chapterAudio.ts";

const MP3 = "/audio/weight-of-small-machines.mp3?v=2";
const OTHER = "/audio/mission-one.mp3";

describe("pickChapterAudio", () => {
  it("picks AAC for the canary when the browser can play it", () => {
    assert.equal(
      pickChapterAudio("weight-of-small-machines", MP3, () => "probably"),
      aacSrc("weight-of-small-machines"),
    );
    assert.equal(
      pickChapterAudio("weight-of-small-machines", MP3, () => "maybe"),
      aacSrc("weight-of-small-machines"),
    );
  });

  it("keeps the MP3 when AAC is not playable", () => {
    assert.equal(
      pickChapterAudio("weight-of-small-machines", MP3, () => ""),
      MP3,
    );
  });

  it("does not pick AAC for chapters without a companion file", () => {
    assert.equal(
      pickChapterAudio("mission-one", OTHER, () => "probably"),
      OTHER,
    );
  });

  it("asks for AAC-LC in MP4", () => {
    assert.equal(AAC_TYPE, 'audio/mp4; codecs="mp4a.40.2"');
  });
});

describe("isAacSrc", () => {
  it("recognizes the companion URL", () => {
    assert.equal(isAacSrc(aacSrc("weight-of-small-machines")), true);
    assert.equal(isAacSrc(MP3), false);
  });
});
