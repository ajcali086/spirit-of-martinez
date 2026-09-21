#!/usr/bin/env node
/**
 * make-responsive-images.mjs
 *
 * Makes smaller WebP copies of every image under public/images so phones
 * download a small file instead of the 1500px original.
 *
 *   node scripts/make-responsive-images.mjs            # default run
 *   node scripts/make-responsive-images.mjs --dry-run  # show the plan only
 *   node scripts/make-responsive-images.mjs --force    # rebuild everything
 *
 * For public/images/archive/jacket.jpg (or .png / .webp) it writes:
 *   public/images/archive/jacket-480w.webp
 *   public/images/archive/jacket-800w.webp
 *   public/images/archive/jacket-1200w.webp
 * Originals are never touched. Sizes larger than the source are skipped
 * (no upscaling). It also writes a manifest your components read to build
 * srcset, so a size that was not made is never requested.
 *
 * Needs Node 18+ and:  npm i -D sharp
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

// ---------- settings (each can be overridden with a flag) ----------
const opts = {
  src: "public/images", //             --src
  manifest: "src/generated/responsive-images.json", // --manifest
  widths: [480, 800, 1200, 1600], //   --widths 480,800,1200,1600
  markWidths: [400, 600], //           --mark-widths 400,600  (small decorative art)
  markDir: "marks", //                 --mark-dir marks
  quality: 78, //                      --quality 78  (WebP, 1-100)
  concurrency: 4, //                   --concurrency 4
  force: false, //                     --force
  dryRun: false, //                    --dry-run
};

function parseArgs(argv) {
  const list = (v) => v.split(",").map((n) => parseInt(n, 10)).filter(Boolean);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--src") opts.src = next();
    else if (a === "--manifest") opts.manifest = next();
    else if (a === "--widths") opts.widths = list(next());
    else if (a === "--mark-widths") opts.markWidths = list(next());
    else if (a === "--mark-dir") opts.markDir = next();
    else if (a === "--quality") opts.quality = parseInt(next(), 10);
    else if (a === "--concurrency") opts.concurrency = parseInt(next(), 10);
    else if (a === "--force") opts.force = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "-h" || a === "--help") {
      console.log("See the comment at the top of this file for usage.");
      process.exit(0);
    } else {
      console.error(`Unknown option: ${a}`);
      process.exit(1);
    }
  }
  opts.widths.sort((x, y) => x - y);
  opts.markWidths.sort((x, y) => x - y);
}

const EXT = /\.(png|jpe?g|webp)$/i;
const GENERATED = /-\d+w\.webp$/i; // files this script made
// When one image exists in several formats, start from the least-compressed.
const RANK = { png: 0, jpg: 1, jpeg: 1, webp: 2 };

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (EXT.test(e.name) && !GENERATED.test(e.name)) out.push(p);
  }
  return out;
}

const kb = (n) => (n / 1024).toFixed(0).padStart(5) + " KB";
const toPosix = (p) => p.split(path.sep).join("/");

async function exists(p) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }),
  );
  return results;
}

async function main() {
  parseArgs(process.argv.slice(2));
  const root = path.resolve(opts.src);
  if (!(await exists(root))) {
    console.error(`Folder not found: ${opts.src}. Use --src to point at your images folder.`);
    process.exit(1);
  }

  // Group files by name-without-extension and pick one source per group.
  const groups = new Map();
  for (const file of await walk(root)) {
    const stem = file.replace(EXT, "");
    const ext = path.extname(file).slice(1).toLowerCase();
    const cur = groups.get(stem);
    if (!cur || RANK[ext] < RANK[cur.ext]) groups.set(stem, { file, ext });
  }

  const manifest = {};
  let made = 0;
  let kept = 0;
  const rows = [];

  await pool([...groups.entries()].sort(), opts.concurrency, async ([stem, { file }]) => {
    const rel = toPosix(path.relative(root, stem));
    const isMark = rel.split("/").includes(opts.markDir);
    const targets = isMark ? opts.markWidths : opts.widths;

    const meta = await sharp(file).metadata();
    const srcW = meta.width ?? 0;
    const srcH = meta.height ?? 0;
    if (!srcW) return;

    // What the page uses today: the full-size WebP sitting beside the source.
    const fullWebp = `${stem}.webp`;
    const fullStat = await exists(fullWebp);

    const srcStat = await fs.stat(file);
    const variants = [];
    const notes = [];

    for (const w of targets) {
      if (w >= srcW) continue; // never upscale
      const out = `${stem}-${w}w.webp`;
      const outStat = await exists(out);
      const fresh = outStat && outStat.mtimeMs >= srcStat.mtimeMs && !opts.force;
      if (fresh) {
        kept++;
        variants.push([w, toPosix(path.relative(root, out)), outStat.size]);
        continue;
      }
      if (opts.dryRun) {
        notes.push(`would write ${path.basename(out)}`);
        variants.push([w, toPosix(path.relative(root, out)), 0]);
        continue;
      }
      const info = await sharp(file)
        .rotate() // respect camera orientation
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: opts.quality, effort: 5, smartSubsample: true })
        .toFile(out);
      made++;
      variants.push([w, toPosix(path.relative(root, out)), info.size]);
    }

    // If there is no full-size WebP yet, make one so srcset has a top rung.
    if (!fullStat && !opts.dryRun) {
      const info = await sharp(file)
        .rotate()
        .webp({ quality: opts.quality, effort: 5, smartSubsample: true })
        .toFile(fullWebp);
      made++;
      notes.push("made full-size .webp");
      variants.push([srcW, toPosix(path.relative(root, fullWebp)), info.size]);
    } else if (fullStat) {
      variants.push([srcW, toPosix(path.relative(root, fullWebp)), fullStat.size]);
    }

    variants.sort((a, b) => a[0] - b[0]);
    manifest[rel] = {
      width: srcW,
      height: srcH,
      variants: variants.map(([w, f]) => [w, f]),
    };
    rows.push({
      rel,
      srcW,
      full: fullStat?.size ?? 0,
      small: variants.find(([w]) => w >= 400 && w < srcW)?.[2] ?? 0,
      sizes: variants.filter(([w]) => w < srcW).map(([w]) => w).join("/"),
      notes: notes.join(", "),
    });
  });

  rows.sort((a, b) => a.rel.localeCompare(b.rel));
  console.log(`\n${"image".padEnd(34)} ${"source".padEnd(7)} ${"today".padStart(8)}  ${"smallest 400-800".padStart(16)}  sizes made`);
  for (const r of rows) {
    console.log(
      `${r.rel.padEnd(34)} ${(r.srcW + "px").padEnd(7)} ${kb(r.full)}  ${(r.small ? kb(r.small) : "     -").padStart(16)}  ${r.sizes || "(none: source is small)"} ${r.notes}`,
    );
  }
  console.log(
    `\n${rows.length} images. ${made} files written, ${kept} already up to date.${opts.dryRun ? " (dry run: nothing written)" : ""}`,
  );

  if (!opts.dryRun) {
    // One image per line keeps the file readable and the git diffs small.
    const lines = Object.entries(manifest)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    await fs.mkdir(path.dirname(path.resolve(opts.manifest)), { recursive: true });
    await fs.writeFile(path.resolve(opts.manifest), `{\n${lines.join(",\n")}\n}\n`);
    console.log(`Manifest: ${opts.manifest}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
