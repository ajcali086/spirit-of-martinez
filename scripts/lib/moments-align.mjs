/**
 * moments-align.mjs — pure functions (no file or network access) that turn
 * one paragraph of text plus the read-along cue entries for that paragraph
 * into verbatim sentence records.
 *
 * Three ways a paragraph can be resolved, best first:
 *   "override"  a human wrote the sentence list (scripts/moments-overrides.json)
 *   "split"     the abbreviation-aware splitter found exactly as many
 *               sentences as there are cues
 *   "timing"    the splitter found MORE sentences than cues (it split at an
 *               initial or abbreviation the alignment did not), so adjacent
 *               pieces are merged to best match the cue durations
 * Anything else is left unresolved and the caller treats the paragraph as
 * paragraph-only (a moment on it means the whole paragraph).
 */

// ---------------------------------------------------------------- text ----

/** Collapse all whitespace runs (including nbsp) to single spaces and trim. */
export const norm = (s) => s.replace(/[\s\u00a0]+/g, " ").trim();

// Words that end in a period without ending the sentence.
const ABBREVIATIONS = new Set(
  (
    "mr mrs ms mx dr prof rev hon sen rep gov pres supt wm chas geo thos jas robt edw lieut " +
    "gen maj col lt capt cpt sgt ssgt tsgt msgt cpl pfc pvt cmdr adm brig " +
    "jr sr st ste mt ft " +
    "co corp inc ltd dept no nos vol vols vs etc approx ca cf " +
    "jan feb mar apr jun jul aug sept sep oct nov dec"
  ).split(" "),
);

/**
 * Split a paragraph into sentences. A candidate boundary is . ! or ?
 * (optionally followed by closing quotes or brackets), then whitespace, then
 * an uppercase letter, digit or opening quote. It is rejected when the word
 * before it is an initial ("Leland W."), a dotted acronym ("U.S."), or a
 * known abbreviation ("Maj.").
 */
export function splitSentences(text) {
  const t = norm(text);
  const out = [];
  let start = 0;
  const boundary = /([.!?])([""'')\]]*)\s+(?=[""''A-Z0-9])/g;
  let m;
  while ((m = boundary.exec(t))) {
    if (m[1] === ".") {
      const before = t.slice(start, m.index + 1);
      const word = before.split(/\s+/).pop().replace(/^[""''(]+/, "");
      const bare = word.replace(/\.$/, "");
      const isInitial = /^[A-Z]$/.test(bare);
      const isDotted = /^(?:[A-Za-z]\.)+[A-Za-z]$/.test(bare); // U.S, T.S
      const isAbbrev = ABBREVIATIONS.has(bare.toLowerCase()) && m[2] === "";
      if (isInitial || isDotted || isAbbrev) continue;
    }
    const end = m.index + m[1].length + m[2].length;
    out.push(t.slice(start, end));
    start = m.index + m[0].length;
  }
  if (start < t.length) out.push(t.slice(start));
  return out;
}

// ------------------------------------------------------------- timing -----

/**
 * Fit  seconds ≈ chars / rate + pause  by least squares over sentences known
 * to be right, ignoring outliers (a paragraph whose audio does not match its
 * text would otherwise drag the fit). Returns {rate (chars/sec), pause (sec), n}.
 */
export function fitSpeech(samples) {
  const fit = (pts) => {
    const n = pts.length;
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const { chars, seconds } of pts) { sx += chars; sy += seconds; sxx += chars * chars; sxy += chars * seconds; }
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const pause = Math.max(0, (sy - slope * sx) / n);
    return { rate: 1 / slope, pause, n };
  };
  if (samples.length < 20) return { rate: 15, pause: 0.3, n: samples.length };
  let f = fit(samples);
  for (let round = 0; round < 3; round++) {
    const kept = samples.filter(({ chars, seconds }) => {
      const e = chars / f.rate + f.pause;
      return Math.abs(seconds - e) / e < 0.5;
    });
    if (kept.length < 20) break;
    f = fit(kept);
  }
  return f;
}

/**
 * How much audio a paragraph has compared with how long it should take to read
 * aloud. About 1 is normal. Near 0 means the cue table squeezed the whole
 * paragraph into a fraction of a second: the audio does not contain this text.
 */
export function audioRatio(text, cues, speech) {
  const seconds = cues.at(-1).end - cues[0].start;
  return seconds / (norm(text).length / speech.rate + speech.pause * cues.length);
}

/** Every way to cut `k` pieces into `n` contiguous groups (as start indexes). */
function* groupings(k, n, limit = 50000) {
  let count = 0;
  const cuts = [];
  function* rec(from, left) {
    if (count >= limit) return;
    if (left === 0) { count++; yield [0, ...cuts]; return; }
    for (let i = from; i <= k - left; i++) {
      cuts.push(i);
      yield* rec(i + 1, left - 1);
      cuts.pop();
    }
  }
  yield* rec(1, n - 1);
}

/**
 * Merge `pieces` (k of them) into exactly `durations.length` (n) groups so the
 * group lengths best match the cue durations. Returns
 * { groups: string[], cost, margin } where margin is second-best cost divided
 * by best cost (bigger means the choice is less ambiguous). Returns null when
 * k < n, since a splitter that found too few sentences cannot be fixed by
 * merging.
 */
export function mergeByTiming(pieces, durations, speech) {
  const k = pieces.length, n = durations.length;
  if (k < n) return null;
  const chars = pieces.map((p) => p.length + 1);
  const prefix = [0];
  for (const c of chars) prefix.push(prefix.at(-1) + c);
  const expected = (i, j) => (prefix[j] - prefix[i]) / speech.rate + speech.pause;
  let best = null, second = Infinity;
  for (const starts of groupings(k, n)) {
    let cost = 0;
    for (let g = 0; g < n; g++) {
      const i = starts[g], j = g + 1 < n ? starts[g + 1] : k;
      const e = expected(i, j), d = durations[g];
      cost += ((d - e) * (d - e)) / (e + 1); // relative-ish squared error
    }
    if (!best || cost < best.cost) {
      if (best) second = Math.min(second, best.cost);
      best = { starts, cost };
    } else if (cost < second) second = cost;
  }
  if (!best) return null;
  const groups = best.starts.map((s, g) =>
    pieces.slice(s, g + 1 < n ? best.starts[g + 1] : k).join(" "),
  );
  return { groups, cost: best.cost, margin: second === Infinity ? Infinity : second / Math.max(best.cost, 1e-6) };
}

// ---------------------------------------------------------- resolution ----

/** How much better the best grouping must be than the runner-up to be trusted. */
export const MIN_MARGIN = 3;

/**
 * Resolve one paragraph.
 * @param text   paragraph text as rendered
 * @param cues   [{id,start,end}] for this paragraph, in order
 * @param speech result of fitSpeech
 * @param opts   { override?: string[]   sentences written by a human,
 *                 useTiming?: boolean   false when the paragraph's audio does not match its text,
 *                 minMargin?: number }
 * @returns one of
 *   {method:"override"|"split", sentences}
 *   {method:"timing", sentences, margin}          trusted merge
 *   {method:"review", proposal, margin, reason}   best guess, NOT trusted
 *   {method:"unresolved", reason}
 */
export function alignParagraph(text, cues, speech, opts = {}) {
  const { override, useTiming = true, minMargin = MIN_MARGIN } = opts;
  const full = norm(text);
  const n = cues.length;

  if (override) {
    if (override.length !== n) return { method: "unresolved", reason: `override has ${override.length} sentences but the cue table has ${n}` };
    if (norm(override.join(" ")) !== full) return { method: "unresolved", reason: "override text does not equal the paragraph on the page" };
    return { method: "override", sentences: override.map(norm) };
  }

  const pieces = splitSentences(full);
  if (pieces.length === n) return { method: "split", sentences: pieces };
  if (pieces.length < n) {
    return { method: "unresolved", reason: `the splitter found ${pieces.length} sentences but the cue table has ${n}` };
  }
  if (!useTiming) {
    return { method: "unresolved", reason: `the splitter found ${pieces.length} sentences, cues ${n}, and this paragraph's audio does not match its text so timing cannot decide` };
  }

  const merged = mergeByTiming(pieces, cues.map((c) => c.end - c.start), speech);
  if (!merged) return { method: "unresolved", reason: "no grouping possible" };
  if (merged.margin >= minMargin) return { method: "timing", sentences: merged.groups, margin: merged.margin };
  return {
    method: "review",
    proposal: merged.groups,
    margin: merged.margin,
    reason: `${pieces.length} sentences found, ${n} cues, and more than one way to merge them fits the timing about equally well`,
  };
}
