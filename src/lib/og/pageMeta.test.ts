import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assetUrl, canonicalUrl, pageMeta, sitePageMeta } from "./pageMeta.ts";

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

  it("keeps a version query on the cover image", () => {
    assert.equal(
      assetUrl("/og.jpg?v=af297258"),
      "https://www.spiritofmartinez.com/og.jpg?v=af297258",
    );
  });

  it("emits image size and alt", () => {
    const head = pageMeta({
      title: "Chapter 9 — Mission One · The Spirit of Martinez",
      description: "Chemnitz, 14 February 1945.",
      path: "/chapters/mission-one",
      image: "/images/hero-fortress.jpg",
      imageAlt: "The locker arranged",
    });
    const props = Object.fromEntries(
      head.meta
        .filter((m): m is { property: string; content: string } => "property" in m)
        .map((m) => [m.property, m.content]),
    );
    assert.equal(props["og:image:width"], "1500");
    assert.equal(props["og:image:height"], "844");
    assert.equal(props["og:image:alt"], "The locker arranged");
    assert.equal(props["og:type"], "article");
  });

  it("stamps home as website with the family line", () => {
    const head = sitePageMeta("/");
    const props = Object.fromEntries(
      head.meta
        .filter((m): m is { property: string; content: string } => "property" in m)
        .map((m) => [m.property, m.content]),
    );
    assert.equal(props["og:type"], "website");
    assert.equal(props["og:url"], "https://www.spiritofmartinez.com/");
    assert.match(props["og:description"] ?? "", /What a Family Kept/);
    assert.equal(props["og:image:width"], "1200");
    assert.equal(props["og:image:height"], "630");
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
