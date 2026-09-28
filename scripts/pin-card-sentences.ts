import { writeFileSync } from "node:fs";
import { chapters } from "../src/data/chapters.ts";
import { cardSentences } from "../src/lib/cardSentences.ts";

const pin = cardSentences(chapters);
const file = new URL("../src/generated/card-sentences.json", import.meta.url);
writeFileSync(file, `${JSON.stringify(pin, null, 2)}\n`);
const sentences = Object.values(pin).reduce(
  (n, page) => n + Object.values(page).reduce((m, list) => m + list.length, 0),
  0,
);
const paragraphs = Object.values(pin).reduce((n, page) => n + Object.keys(page).length, 0);
console.log(`card sentences: ${paragraphs} paragraphs, ${sentences} sentences`);
