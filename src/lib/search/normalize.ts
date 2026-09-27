/** Curly quotes and dashes folded so a typed query meets the book's type. */
export function normalizeWithMap(input: string): { text: string; map: number[] } {
  const chars: string[] = [];
  const map: number[] = [];
  let pendingSpace = false;
  for (let i = 0; i < input.length; i++) {
    let ch = input[i];
    if (ch === "‘" || ch === "’" || ch === "‚" || ch === "‛") ch = "'";
    else if (ch === "“" || ch === "”" || ch === "„" || ch === "‟") ch = '"';
    else if (ch === "—" || ch === "–") ch = "-";
    if (/\s/.test(ch)) {
      if (chars.length > 0) pendingSpace = true;
      continue;
    }
    if (pendingSpace) {
      chars.push(" ");
      map.push(i);
      pendingSpace = false;
    }
    chars.push(ch.toLowerCase());
    map.push(i);
  }
  return { text: chars.join(""), map };
}

export function normalize(input: string): string {
  return normalizeWithMap(input).text;
}

export function isTypingTarget(
  target: { tagName?: string; isContentEditable?: boolean } | null,
): boolean {
  if (!target?.tagName) return false;
  const tag = target.tagName.toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(target.isContentEditable);
}
