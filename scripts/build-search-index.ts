import { writeFileSync } from "node:fs";
import { buildSearchIndex } from "../src/lib/search/corpus.ts";

const index = buildSearchIndex();
writeFileSync(
  new URL("../src/generated/search-index.json", import.meta.url),
  JSON.stringify(index),
);
console.log(`search index: ${index.length} records`);
