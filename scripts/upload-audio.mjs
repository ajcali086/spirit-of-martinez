/**
 * The readings and the music live in the spirit-audio Blob store; the site
 * plays them from there (src/lib/chapterAudio.ts). The repository keeps no
 * copies. To replace or add one, put the file in public/audio/ (an MP3, and
 * its AAC from scripts/encode-chapter-aac.py) and bump the chapter's `?v=`
 * in src/data/chapters.ts so browsers fetch it fresh: the production build
 * uploads every file there whose size differs from the store's copy. Once
 * it's live, the file can come out of the repository again.
 *
 * Production builds only (VERCEL_ENV=production, with BLOB_READ_WRITE_TOKEN):
 * a pull request's preview never overwrites what the live site plays.
 */
import { readdirSync, readFileSync } from "node:fs";

const token = process.env.BLOB_READ_WRITE_TOKEN;
const origin = "https://e5krwqut3ljb7kbi.public.blob.vercel-storage.com";
const dir = new URL("../public/audio/", import.meta.url);
const TYPES = { ".mp3": "audio/mpeg", ".m4a": "audio/mp4" };

if (process.env.VERCEL_ENV !== "production" || !token) {
  console.log("audio: not a production build with a blob token, leaving the store alone");
  process.exit(0);
}

const files = readdirSync(dir).filter((f) => Object.keys(TYPES).some((ext) => f.endsWith(ext)));
if (!files.length) {
  console.log("audio: nothing in public/audio to upload");
  process.exit(0);
}

async function sameSize(pathname, bytes) {
  const res = await fetch(`${origin}/${pathname}`, { method: "HEAD" });
  if (!res.ok) return false;
  return Number(res.headers.get("content-length")) === bytes;
}

async function put(pathname, contentType) {
  const body = readFileSync(new URL(pathname, dir));
  if (await sameSize(pathname, body.length)) {
    console.log(`audio: ${pathname} already ${body.length} bytes`);
    return;
  }
  const res = await fetch(`https://vercel.com/api/blob/?pathname=${encodeURIComponent(pathname)}`, {
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
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`upload ${pathname} failed (${res.status}): ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  console.log(`audio: uploaded ${json.pathname ?? pathname}`);
}

for (const file of files) await put(file, TYPES[file.slice(file.lastIndexOf("."))]);
