/** Map-label packing: each item sits at its anchor, or just below the previous. */
export function deconflictTops(
  items: { anchorY: number; height: number }[],
  gap = 5,
): number[] {
  let cursor = Number.NEGATIVE_INFINITY;
  return items.map(({ anchorY, height }) => {
    const top = Math.max(anchorY, cursor);
    cursor = top + height + gap;
    return top;
  });
}
