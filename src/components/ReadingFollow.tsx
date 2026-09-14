import { useEffect, useRef, useState } from "react";
import { useBookAudio } from "@/components/layout/BookAudio";
import { chapterCues, cueAt } from "@/data/cues";

export function useReadingFollow(slug: string) {
  const { track, playing, time } = useBookAudio();
  const cues = chapterCues[slug];
  const listening =
    Boolean(cues) &&
    playing &&
    track?.kind === "chapter" &&
    track.slug === slug;
  const activeId = listening ? (cueAt(cues, time)?.id ?? null) : null;
  const [follow, setFollow] = useState(true);
  const ignoreUntil = useRef(0);

  useEffect(() => {
    setFollow(true);
  }, [slug]);

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
  }, []);

  useEffect(() => {
    if (!listening || !follow || !activeId) return;
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
  }, [activeId, follow, listening]);

  return {
    activeId,
    listening,
    follow,
    resume: () => setFollow(true),
  };
}

export function ResumeFollow({
  show,
  onResume,
}: {
  show: boolean;
  onResume: () => void;
}) {
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={onResume}
      className="fixed bottom-4 left-4 z-40 min-h-11 bg-ink px-4 text-[0.68rem] tracking-[0.16em] text-brass uppercase ring-1 ring-brass/60 hover:bg-ink-soft sm:bottom-6 sm:left-6"
    >
      Resume follow
    </button>
  );
}
