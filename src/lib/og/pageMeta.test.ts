import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assetUrl, canonicalUrl, pageMeta } from "./pageMeta.ts";

describe("canonicalUrl", () => {
  it("is always www, never apex", () => {
    assert.equal(
      canonicalUrl("/chapters/mission-one"),
      "https://www.spiritofmartinez.com/chapters/mission-one",
    );
    assert.equal(canonicalUrl("/"), "https://www.spiritofmartinez.com/");
    assert.equal(
      canonicalUrl("/archive/crew/"),
      "https://www.spiritofmartinez.com/archive/crew",
    );
  });
});

describe("pageMeta", () => {
  it("stamps og:url as the www canonical", () => {
    const head = pageMeta({
      title: "Chapter 9 — Mission One · The Spirit of Martinez",
      description: "Chemnitz, 14 February 1945.",
      path: "/chapters/mission-one",
      image: "/images/hero-fortress.jpg",
    });
    const url = head.meta.find((m) => "property" in m && m.property === "og:url");
    assert.deepEqual(url, {
      property: "og:url",
      content: "https://www.spiritofmartinez.com/chapters/mission-one",
    });
    assert.equal(
      head.links[0].href,
      "https://www.spiritofmartinez.com/chapters/mission-one",
    );
    assert.equal(JSON.stringify(head).includes("https://spiritofmartinez.com/"), false);
  });

  it("gives plate srcs a .jpg so crawlers fetch a file", () => {
    assert.equal(
      assetUrl("/images/archive/crew"),
      "https://www.spiritofmartinez.com/images/archive/crew.jpg",
    );
    assert.equal(
      assetUrl("/images/footlocker.jpg"),
      "https://www.spiritofmartinez.com/images/footlocker.jpg",
    );
  });
});
