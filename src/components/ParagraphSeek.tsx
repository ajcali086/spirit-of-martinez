import { useEffect, useRef, useState, type RefObject } from "react";
import { isParagraphCue, registerSeekTap, type SeekTap } from "@/lib/paragraphSeek";

const HINT_KEY = "som-seek-hint";
const MOVE_PX = 10;
const HOLD_MS = 500;

function paragraphCue(root: HTMLElement, node: EventTarget | null): string | null {
  if (!(node instanceof Element)) return null;
  if (node.closest("a, button, input, textarea, select, label")) return null;
  const p = node.closest("p[data-cue]");
  if (!p || !root.contains(p)) return null;
  const id = p.getAttribute("data-cue");
  if (!id || !isParagraphCue(id)) return null;
  return id;
}

export function useParagraphDoubleTap(
  ref: RefObject<HTMLElement | null>,
  onSeek: (cueId: string) => void,
  enabled: boolean,
) {
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    let prev: SeekTap | null = null;
    let down: { x: number; y: number; t: number } | null = null;
    let swallowClick = false;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (!paragraphCue(root, e.target)) {
        down = null;
        return;
      }
      down = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    };

    const onUp = (e: PointerEvent) => {
      if (!down) return;
      const start = down;
      down = null;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > MOVE_PX) {
        prev = null;
        return;
      }
      if (e.timeStamp - start.t > HOLD_MS) {
        prev = null;
        return;
      }
      const id = paragraphCue(root, e.target);
      if (!id) return;
      const result = registerSeekTap(prev, id, e.timeStamp);
      prev = result.next;
      if (!result.seek) return;
      e.preventDefault();
      swallowClick = true;
      window.getSelection()?.removeAllRanges();
      onSeekRef.current(id);
    };

    const onClick = (e: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
    };

    const onDbl = (e: MouseEvent) => {
      if (!paragraphCue(root, e.target)) return;
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
    };

    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("click", onClick);
    root.addEventListener("dblclick", onDbl);
    return () => {
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("click", onClick);
      root.removeEventListener("dblclick", onDbl);
    };
  }, [enabled, ref]);
}

export function PlayFromHere({ onPlay }: { onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="inline-flex min-h-11 items-center font-sans text-[0.68rem] tracking-[0.16em] text-feather uppercase hover:text-ink"
    >
      Play from here
    </button>
  );
}

export function SeekHint({ armed }: { armed: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!armed) return;
    try {
      if (!localStorage.getItem(HINT_KEY)) setOpen(true);
    } catch {
      /* storage blocked: no hint */
    }
  }, [armed]);

  useEffect(() => {
    const dismiss = () => {
      setOpen(false);
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {
        /* already gone from the page */
      }
    };
    window.addEventListener("som-seek-used", dismiss);
    return () => window.removeEventListener("som-seek-used", dismiss);
  }, []);

  if (!open) return null;

  return (
    <p className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-sans text-sm leading-relaxed text-ink-soft">
      <span>Double-tap a paragraph to listen from there.</span>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          try {
            localStorage.setItem(HINT_KEY, "1");
          } catch {
            /* the line is gone either way */
          }
        }}
        className="inline-flex min-h-11 shrink-0 items-center font-sans text-[0.68rem] tracking-[0.16em] text-feather uppercase hover:text-ink"
      >
        Dismiss
      </button>
    </p>
  );
}
