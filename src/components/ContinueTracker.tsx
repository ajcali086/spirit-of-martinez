import { useEffect } from "react";
import {
  chapterContinueRecord,
  plateContinueRecord,
  writeContinue,
} from "@/lib/continue";

const SETTLE_MS = 1000;

function stillInHero(root: Element) {
  return root.getBoundingClientRect().top > window.innerHeight * 0.4;
}

function readLine() {
  const player =
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--player-h"),
    ) || 0;
  return Math.min(240, Math.max(140, 96 + player + 56));
}

function nearestParagraph(root: Element): HTMLElement | null {
  const nodes = root.querySelectorAll<HTMLElement>("p[id]");
  if (!nodes.length) return null;
  const line = readLine();
  let best: HTMLElement | null = null;
  let bestDist = Infinity;
  for (const node of nodes) {
    const top = node.getBoundingClientRect().top;
    const dist = Math.abs(top - line);
    if (dist < bestDist) {
      best = node;
      bestDist = dist;
    }
  }
  return best;
}

export function ContinueTracker({
  kind,
  slug,
}: {
  kind: "chapter" | "plate";
  slug: string;
}) {
  useEffect(() => {
    let timer: number | undefined;
    let last = "";

    const capture = () => {
      if (kind === "plate") {
        const root = document.querySelector("[data-continue-root='plate']");
        if (!root || stillInHero(root)) return;
        const rec = plateContinueRecord(slug);
        if (!rec || rec.url === last) return;
        last = rec.url;
        writeContinue(rec);
        return;
      }
      const root = document.querySelector("[data-continue-root='chapter']");
      if (!root || stillInHero(root)) return;
      const p = nearestParagraph(root);
      if (!p?.id) return;
      const section = p.closest<HTMLElement>("section[id]");
      const rec = chapterContinueRecord({
        slug,
        paragraphId: p.id,
        sectionId: section?.id ?? "",
        sectionTitle: section?.querySelector("h2")?.textContent?.trim() ?? "",
      });
      if (!rec || rec.url === last) return;
      last = rec.url;
      writeContinue(rec);
    };

    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(capture, SETTLE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [kind, slug]);

  return null;
}
