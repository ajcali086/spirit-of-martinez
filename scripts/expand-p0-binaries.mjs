#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  {
    b64: "src/routes/chapters.$slug.tsx.b64gz",
    out: "src/routes/chapters.$slug.tsx",
  },
  {
    b64: "src/components/layout/BookAudio.tsx.b64gz",
    out: "src/components/layout/BookAudio.tsx",
  },
];

for (const { b64, out } of files) {
  const b64Path = join(root, b64);
  const outPath = join(root, out);
  let raw;
  try {
    raw = readFileSync(b64Path, "utf8").trim();
  } catch {
    continue; // optional
  }
  const bytes = gunzipSync(Buffer.from(raw, "base64"));
  writeFileSync(outPath, bytes);
  console.log(`expanded ${out} (${bytes.length} bytes)`);
}
