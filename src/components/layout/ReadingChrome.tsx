import { useEffect, useState } from "react";

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-brass focus:px-4 focus:py-3 focus:text-sm focus:tracking-[0.14em] focus:text-ink focus:uppercase"
    >
      Skip to content
    </a>
  );
}

export function ReadingProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-rule/40"
      aria-hidden
    >
      <div className="h-full bg-brass" style={{ width: `${p * 100}%` }} />
    </div>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 720);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      className="fixed right-4 bottom-4 z-40 min-h-11 bg-brass px-4 text-[0.68rem] tracking-[0.16em] text-ink uppercase hover:bg-brass-dim sm:right-6 sm:bottom-6"
      aria-label="Back to top"
    >
      Top
    </button>
  );
}
