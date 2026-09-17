import { useEffect, useState } from "react";

export function CopyLink({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"share" | "copy">("copy");

  useEffect(() => {
    const share = typeof navigator.share === "function";
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setMode(share && coarse ? "share" : "copy");
  }, []);

  async function onShare() {
    if (mode === "share") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className="inline-flex min-h-11 shrink-0 items-center font-sans text-[0.68rem] tracking-[0.16em] text-feather uppercase hover:text-ink"
    >
      {copied ? "Link copied" : mode === "share" ? "Share" : "Copy link"}
    </button>
  );
}
