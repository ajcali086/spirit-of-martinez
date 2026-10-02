/**
 * Adds every model ID not yet frozen to src/model/frozen.json, and a
 * fingerprint of every piece of published text not yet fingerprinted to
 * src/data/published-text.json, as ingested. Fills blanks only; never
 * removes, renumbers or overwrites. A withdrawn ID moves to `retired` by
 * hand and is never reused: the tombstone. Run after a publish by
 * .github/workflows/freeze.yml, or by hand:
 *
 *   node --experimental-strip-types --import ./scripts/test-register.mjs scripts/freeze-model.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { FROZEN_KINDS, fingerprint, inUse, ingestedText } from "../src/model/validate.ts";

const file = new URL("../src/model/frozen.json", import.meta.url);
const frozen = JSON.parse(readFileSync(file, "utf8")) as Record<string, string[]> & {
  retired: string[];
};
let added = 0;
for (const kind of FROZEN_KINDS) {
  frozen[kind] ??= [];
  for (const id of inUse[kind]) {
    if (frozen.retired.includes(id)) throw new Error(`${id} is retired and may not be reused`);
    if (!frozen[kind].includes(id)) {
      frozen[kind].push(id);
      added++;
    }
  }
}
const { retired, ...rest } = frozen;
writeFileSync(file, JSON.stringify({ ...rest, retired }, null, 2) + "\n");
console.log(`froze ${added} new ID(s); ${Object.values(inUse).flat().length} in use`);

const textFile = new URL("../src/data/published-text.json", import.meta.url);
const published = JSON.parse(readFileSync(textFile, "utf8")) as Record<string, string>;
let fingerprinted = 0;
for (const [key, text] of ingestedText) {
  if (key in published) continue;
  published[key] = fingerprint(text);
  fingerprinted++;
}
writeFileSync(textFile, JSON.stringify(published, null, 2) + "\n");
console.log(
  `fingerprinted ${fingerprinted} new passage(s); ${Object.keys(published).length} in all`,
);
