/**
 * Overwrite the chapter 1 reading in spirit-audio.
 * Runs during the Vercel build, where BLOB_READ_WRITE_TOKEN exists.
 * Locally there is no token, so this does nothing.
 */
import { readFileSync, statSync } from "node:fs";

const token = process.env.BLOB_READ_WRITE_TOKEN;
const origin = "https://e5krwqut3ljb7kbi.public.blob.vercel-storage.com";
const files = [
  ["public/audio/weight-of-small-machines.mp3", "weight-of-small-machines.mp3", "audio/mpeg"],
  ["public/audio/weight-of-small-machines.m4a", "weight-of-small-machines.m4a", "audio/mp4"],
];

if (!token) {
  console.log("chapter 1 audio: no blob token, leaving the store alone");
  process.exit(0);
}

async function sameSize(pathname, bytes) {
  const res = await fetch(`${origin}/${pathname}`, { method: "HEAD" });
  if (!res.ok) return false;
  return Number(res.headers.get("content-length")) === bytes;
}

async function put(pathname, file, contentType) {
  const body = readFileSync(file);
  if (await sameSize(pathname, body.length)) {
    console.log(`chapter 1 audio: ${pathname} already ${body.length} bytes`);
    return;
  }
  const res = await fetch(
    `https://vercel.com/api/blob/?pathname=${encodeURIComponent(pathname)}`,
    {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "x-api-version": "12",
        "x-content-length": String(body.length),
        "x-content-type": contentType,
        "x-vercel-blob-access": "public",
        "x-add-random-suffix": "0",
        "x-allow-overwrite": "1",
        "x-cache-control-max-age": "31536000",
      },
      body,
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`upload ${pathname} failed (${res.status}): ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  console.log(`chapter 1 audio: uploaded ${json.pathname ?? pathname}`);
}

for (const [file, pathname, type] of files) {
  statSync(file);
  await put(pathname, file, type);
}
