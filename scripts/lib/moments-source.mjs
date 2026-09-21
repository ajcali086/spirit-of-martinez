/**
 * moments-source.mjs — reads the two inputs:
 *   1. the read-along cue tables (from a JSON file or from the source file
 *      that currently holds them), and
 *   2. the text of each chapter as the site renders it (the server HTML).
 * No dependencies.
 */
import { norm } from "./moments-align.mjs";

// ----------------------------------------------------------- cue tables ----

/**
 * Accepts either
 *   JSON:  { "slug": [ {"id":"7.1-p0-s0","start":16.68,"end":25.66}, ... ] }
 *          (entries may also be [id,start,end] tuples)
 *   JS/TS source containing object literals like
 *          "slug": [ { id: `ch-num`, start: 0, end: 1.24 }, ... ]
 *          in any quoting style, minified or not.
 * Returns { slug: [{id,start,end}] } in document order.
 */
export function parseCues(raw, fileName = "") {
  const looksJson = /\.json$/i.test(fileName) || /^\s*[{[]/.test(raw) && !/\bid\s*:/.test(raw.slice(0, 2000));
  if (looksJson) {
    const j = JSON.parse(raw);
    const out = {};
    for (const [slug, list] of Object.entries(j.cues && !Array.isArray(j.cues) ? j.cues : j)) {
      out[slug] = list.map((e) => (Array.isArray(e) ? { id: e[0], start: e[1], end: e[2] } : { id: e.id, start: e.start, end: e.end }));
    }
    return out;
  }
  const num = "(-?\\d*\\.?\\d+)";
  const re = new RegExp(
    "([\"'`]?)([a-z0-9][a-z0-9-]*)\\1\\s*:\\s*\\[\\s*(?=\\{\\s*id\\s*:)" + // "slug": [ {id:
      "|\\{\\s*id\\s*:\\s*([\"'`])([^\"'`]+)\\3\\s*,\\s*start\\s*:\\s*" + num + "\\s*,\\s*end\\s*:\\s*" + num + "\\s*\\}",
    "g",
  );
  const out = {};
  let slug = null, m;
  while ((m = re.exec(raw))) {
    if (m[2]) { slug = m[2]; out[slug] = []; }
    else if (slug) out[slug].push({ id: m[4], start: parseFloat(m[5]), end: parseFloat(m[6]) });
  }
  if (!Object.keys(out).length) throw new Error("No cue tables found. Expected entries like { id: \"7.1-p0-s0\", start: 16.68, end: 25.66 }.");
  return out;
}

// ----------------------------------------------------------------- HTML ----

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", hellip: "…" };
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    const v = NAMED[e.toLowerCase()];
    if (v === undefined) throw new Error(`Unknown HTML entity ${all}; add it to NAMED in moments-source.mjs`);
    return v;
  });
}

// Opening tag with properly quoted attributes (class values may contain ">").
const OPEN_TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s"'<>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
const ATTR_CUE = /\sdata-cue\s*=\s*"([^"]*)"/;

// Decorations inside a paragraph that are not part of the spoken text:
// buttons, icons, and the mission-number badge (a span with tabular-nums).
// Add data-cue-skip to any other decorative element and it is ignored too.
const NOT_TEXT = [
  /<button\b[\s\S]*?<\/button>/g,
  /<svg\b[\s\S]*?<\/svg>/g,
  /<span\b[^>]*\btabular-nums\b[^>]*>[\s\S]*?<\/span>/g,
  /<(\w+)\b[^>]*\bdata-cue-skip\b[^>]*>[\s\S]*?<\/\1>/g,
  /<!--[\s\S]*?-->/g,
];

/** Index just past the closing tag that matches the element opened at `from`. */
function closeIndex(html, tag, from) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, "gi");
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    if (m[2] === "/") continue;
    depth += m[1] ? -1 : 1;
    if (depth === 0) return { innerEnd: m.index, end: re.lastIndex };
  }
  return null;
}

/**
 * Every element carrying data-cue, in page order.
 * @returns [{id, tag, text}]  text is what a reader sees, whitespace-collapsed
 */
export function extractCueElements(html) {
  const out = [];
  OPEN_TAG.lastIndex = 0;
  let m;
  while ((m = OPEN_TAG.exec(html))) {
    const cue = ATTR_CUE.exec(m[2]);
    if (!cue || m[3] === "/") continue;
    const close = closeIndex(html, m[1], OPEN_TAG.lastIndex);
    if (!close) continue;
    let inner = html.slice(OPEN_TAG.lastIndex, close.innerEnd);
    for (const re of NOT_TEXT) inner = inner.replace(re, "");
    const text = norm(decodeEntities(inner.replace(/<[^>]+>/g, "")));
    if (/[<>]/.test(text)) throw new Error(`Markup left in the text of ${cue[1]}: ${text.slice(0, 80)}`);
    out.push({ id: decodeEntities(cue[1]), tag: m[1].toLowerCase(), text });
  }
  return out;
}

/** Chapter slugs linked from a /chapters index page. */
export function discoverSlugs(indexHtml) {
  return [...new Set([...indexHtml.matchAll(/href="\/chapters\/([a-z0-9-]+)"/g)].map((x) => x[1]))];
}
