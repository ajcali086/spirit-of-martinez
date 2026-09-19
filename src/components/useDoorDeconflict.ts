import { useLayoutEffect } from "react";
import { deconflictTops } from "@/lib/deconflict";

const XL = "(min-width: 1280px)";
const GAP = 5;

/**
 * Margin doors share one Y when several plates hang off one paragraph.
 * Pack them in document order so every chip is reachable.
 * Test case: 11.3-p4 (nose, crusher, spiritpage, crew, namespread).
 */
export function useDoorDeconflict(slug: string) {
  useLayoutEffect(() => {
    const mq = window.matchMedia(XL);
    let cancelled = false;

    const apply = () => {
      const doors = [
        ...document.querySelectorAll<HTMLElement>("[data-passage-door]"),
      ];
      if (!mq.matches) {
        for (const door of doors) door.style.removeProperty("top");
        return;
      }
      const measured = doors.map((door) => {
        const wrap = door.offsetParent as HTMLElement | null;
        const para = wrap?.querySelector("p");
        const box = (para ?? wrap ?? door).getBoundingClientRect();
        const wrapBox = (wrap ?? door).getBoundingClientRect();
        return {
          door,
          wrapTop: wrapBox.top + window.scrollY,
          anchorY: box.top + window.scrollY,
          height: door.getBoundingClientRect().height,
        };
      });
      const tops = deconflictTops(measured, GAP);
      measured.forEach((item, i) => {
        item.door.style.top = `${tops[i] - item.wrapTop}px`;
      });
    };

    let frame = 0;
    const run = () => {
      if (cancelled) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };

    run();
    void document.fonts?.ready.then(run);
    mq.addEventListener("change", run);
    window.addEventListener("resize", run);
    const ro = new ResizeObserver(run);
    for (const door of document.querySelectorAll("[data-passage-door]")) {
      ro.observe(door);
    }
    const article = document.querySelector("article");
    if (article) ro.observe(article);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      mq.removeEventListener("change", run);
      window.removeEventListener("resize", run);
      ro.disconnect();
    };
  }, [slug]);
}
