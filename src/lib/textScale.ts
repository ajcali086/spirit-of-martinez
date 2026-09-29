export const TEXT_SCALE_KEY = "som-text-scale";

export const TEXT_SCALES = [1, 1.12, 1.25, 1.37, 1.5] as const;

export type TextScale = (typeof TEXT_SCALES)[number];

const TEXT_SCALE_STRINGS = TEXT_SCALES.map(String);

export function parseTextScale(raw: string | null): TextScale {
  const i = raw == null ? -1 : TEXT_SCALE_STRINGS.indexOf(raw);
  return i === -1 ? 1 : TEXT_SCALES[i];
}

export function textScalePercent(scale: TextScale): string {
  return `${Math.round(scale * 100)}%`;
}

/** Runs in the document head, before first paint. Same strings as parseTextScale. */
export const TEXT_SCALE_BOOT = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(TEXT_SCALE_KEY)});var steps=${JSON.stringify(TEXT_SCALE_STRINGS)};if(steps.indexOf(raw)!==-1)document.documentElement.style.setProperty("--chapter-text-scale",raw);}catch(e){}})();`;
