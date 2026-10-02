export const FIND_DELAY_MS = 300;
export const FIND_GIVE_UP_MS = 3500;
const STALL_MS = 800;
const SETTLED_SEC = 0.8;

/** The playhead is already on the passage, whether or not playback has started. */
export function seekArrived(current: number, target: number): boolean {
  return (
    Number.isFinite(current) && Number.isFinite(target) && Math.abs(current - target) < SETTLED_SEC
  );
}

/** The reading has reached the passage and is actually playing. */
export function seekSettled(current: number, target: number, paused: boolean): boolean {
  return !paused && seekArrived(current, target);
}

/** The finding mark only appears once a seek has genuinely taken a moment. */
export function findingVisible(elapsedMs: number, settled: boolean): boolean {
  return !settled && elapsedMs >= FIND_DELAY_MS;
}

export function passageParagraph(id: string): HTMLElement | null {
  if (!id || typeof document === "undefined") return null;
  const byCue = document.querySelector(`p[data-cue="${CSS.escape(id)}"]`);
  if (byCue instanceof HTMLElement) return byCue;
  const byId = document.getElementById(id);
  if (byId instanceof HTMLElement && byId.tagName === "P") return byId;
  return null;
}

function revealPassage(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  if (rect.top >= 24 && rect.bottom <= window.innerHeight - 24) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
}

let active: (() => void) | null = null;

/** Scroll to the passage now. Pulse it only if the audio has not arrived within 300ms. */
export function beginPassageFind(paragraphId: string, targetTime: number): () => void {
  active?.();
  const paragraph = passageParagraph(paragraphId);
  if (paragraph) revealPassage(paragraph);

  let settled = false;
  let stall = 0;
  const audio = () => document.querySelector("audio");

  const finish = () => {
    window.clearTimeout(timer);
    window.clearTimeout(giveUp);
    window.clearTimeout(stall);
    paragraph?.classList.remove("is-finding");
    const el = audio();
    el?.removeEventListener("seeked", onMedia);
    el?.removeEventListener("playing", onMedia);
    el?.removeEventListener("timeupdate", onMedia);
    el?.removeEventListener("error", onError);
    if (active === finish) active = null;
  };

  const onMedia = () => {
    const el = audio();
    if (!el) return;
    if (seekSettled(el.currentTime, targetTime, el.paused)) {
      settled = true;
      finish();
      return;
    }
    if (seekArrived(el.currentTime, targetTime)) {
      if (!stall) {
        stall = window.setTimeout(() => {
          if (!settled) finish();
        }, STALL_MS);
      }
      return;
    }
    window.clearTimeout(stall);
    stall = 0;
  };

  const onError = () => {
    settled = true;
    finish();
  };

  const timer = window.setTimeout(() => {
    if (settled) return;
    onMedia();
    if (settled) return;
    const el = audio();
    if (el && seekArrived(el.currentTime, targetTime)) return;
    if (!findingVisible(FIND_DELAY_MS, settled)) return;
    paragraph?.classList.add("is-finding");
  }, FIND_DELAY_MS);

  const giveUp = window.setTimeout(finish, FIND_GIVE_UP_MS);

  const el = audio();
  el?.addEventListener("seeked", onMedia);
  el?.addEventListener("playing", onMedia);
  el?.addEventListener("timeupdate", onMedia);
  el?.addEventListener("error", onError);

  active = finish;
  return finish;
}
