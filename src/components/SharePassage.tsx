import { useState } from "react";
import { chapterBySlug } from "@/data/chapters";
import { photos } from "@/data/photos";
import type { PhotoId } from "@/data/types";
import { loadAudioBuffer } from "@/lib/audioBlob";
import { pickChapterAudio } from "@/lib/chapterAudio";
import { loadChapterMoments } from "@/lib/chapterMoments";
import { slicePassageWav } from "@/lib/clipSlice";
import { canonicalUrl } from "@/lib/og/pageMeta";
import { renderPassageCard } from "@/lib/passageCard";
import {
  cueWindowForParagraph,
  formatListenLabel,
  passageHref,
} from "@/lib/passageShare";

function downloadFile(file: File) {
  const href = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = href;
  a.download = file.name;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(href);
}

async function tryShare(opts: {
  title: string;
  text: string;
  url: string;
  files: File[];
}): Promise<"shared" | "abort" | "fallback"> {
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (opts.files.length && typeof nav.canShare === "function") {
    const withFiles: ShareData = {
      title: opts.title,
      text: `${opts.text}\n\n${opts.url}`,
      files: opts.files,
    };
    try {
      if (nav.canShare(withFiles)) {
        await navigator.share(withFiles);
        return "shared";
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "abort";
    }
  }
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
      });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "abort";
    }
  }
  return "fallback";
}

async function encodedChapter(slug: string, fallback: string): Promise<ArrayBuffer> {
  const src = pickChapterAudio(slug, fallback);
  try {
    return await loadAudioBuffer(src);
  } catch {
    if (src !== fallback) return loadAudioBuffer(fallback);
    throw new Error("audio");
  }
}

export function SharePassage({
  photoId,
  slug,
  paragraphId,
  text,
  chapterNumber,
  chapterTitle,
}: {
  photoId: PhotoId;
  slug: string;
  paragraphId: string;
  text: string;
  chapterNumber: number;
  chapterTitle: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "copied" | "fail">("idle");

  async function onShare() {
    if (state === "busy") return;
    setState("busy");
    try {
      const chapter = chapterBySlug(slug);
      const photo = photos[photoId];
      const moments = chapter ? await loadChapterMoments(chapter.slug) : null;
      const cue = chapter
        ? cueWindowForParagraph(chapter, moments, paragraphId)
        : null;
      const url = canonicalUrl(passageHref(slug, paragraphId, cue?.start ?? null));
      const kicker = `Chapter ${chapterNumber} · ${chapterTitle}`;
      const quote = text.trim();
      const listen = cue ? formatListenLabel(cue.end - cue.start) : null;

      let card: Blob | null = null;
      try {
        card = await renderPassageCard({
          imageUrl: `${photo.src}.jpg`,
          kicker,
          quote,
          listen,
        });
      } catch {
        card = null;
      }

      let wav: Blob | null = null;
      if (cue && chapter?.audio) {
        try {
          const buf = await encodedChapter(chapter.slug, chapter.audio);
          const Ctx = window.AudioContext;
          const ctx = new Ctx();
          try {
            await ctx.resume();
            wav = await slicePassageWav(buf, cue.start, cue.end, ctx);
          } finally {
            await ctx.close();
          }
        } catch {
          wav = null;
        }
      }

      const files: File[] = [];
      if (card) {
        files.push(
          new File([card], "spirit-of-martinez.jpg", { type: "image/jpeg" }),
        );
      }
      if (wav) {
        files.push(new File([wav], "passage.wav", { type: "audio/wav" }));
      }

      const title = `${kicker} — The Spirit of Martinez`;
      const shareText = quote ? `“${quote.replace(/^["“]|["”]$/g, "")}”` : title;
      const result = await tryShare({ title, text: shareText, url, files });
      if (result === "abort") {
        setState("idle");
        return;
      }
      if (result === "shared") {
        setState("idle");
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* clipboard blocked */
      }
      for (const file of files) downloadFile(file);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("fail");
      window.setTimeout(() => setState("idle"), 2000);
    }
  }

  const label =
    state === "busy"
      ? "Preparing"
      : state === "copied"
        ? "Link copied"
        : state === "fail"
          ? "Could not share"
          : "Share this passage";

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      disabled={state === "busy"}
      aria-busy={state === "busy"}
      className="inline-flex min-h-11 items-center font-sans text-[0.68rem] tracking-[0.16em] text-feather uppercase hover:text-ink disabled:opacity-60"
    >
      {label}
    </button>
  );
}
