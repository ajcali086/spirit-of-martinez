import { useEffect, useMemo, useRef } from "react";
import { useBookAudio } from "@/components/layout/BookAudio";
import { chapterCues, collapseToParagraphs, cueAt } from "@/data/cues";
import { sentenceCues } from "@/data/sentenceCues";

export function useReadingFollow(slug: string) {
  const { track, playing, ended, time, follow, setFollow } = useBookAudio();
  const paraCues = chapterCues[slug];
  const aligned = sentenceCues[slug];
  const cues = useMemo(() => {
    if (aligned) return collapseToParagraphs(aligned);
    return paraCues;
  }, [aligned, paraCues]);
  const onThisChapter =
    Boolean(cues) && track?.kind === "chapter" && track.slug === slug && !ended;
  const activeId = onThisChapter ? (cueAt(cues ?? [], time)?.id ?? null) : null;
  const ignoreUntil = useRef(0);

  useEffect(() => {
    const pause = (e: Event) => {
      if (Date.now() < ignoreUntil.current) return;
      if (e instanceof KeyboardEvent) {
        if (
          !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
            e.key,
          )
        ) {
          return;
        }
      }
      setFollow(false);
    };
    window.addEventListener("wheel", pause, { passive: true });
    window.addEventListener("touchmove", pause, { passive: true });
    window.addEventListener("keydown", pause);
    return () => {
      window.removeEventListener("wheel", pause);
      window.removeEventListener("touchmove", pause);
      window.removeEventListener("keydown", pause);
    };
  }, [setFollow]);

  useEffect(() => {
    if (!playing || !follow || !activeId) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const el = document.querySelector<HTMLElement>(`[data-cue="${activeId}"]`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const topBound = 8 * 16;
    const bottomBound = window.innerHeight - 72;
    if (rect.top >= topBound && rect.bottom <= bottomBound) return;
    ignoreUntil.current = Date.now() + 900;
    el.scrollIntoView({
      block: "center",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [activeId, follow, playing]);

  return {
    activeId,
    listening: onThisChapter && playing,
    follow,
    resume: () => setFollow(true),
  };
}
