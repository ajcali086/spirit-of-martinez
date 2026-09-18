import { useEffect, useState } from "react";

export function CopyLink({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function onShare() {
    try {
      await navigator.share({ title, url });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copy();
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <span className="flex shrink-0 items-center gap-4">
      {canShare ? (
        <button
          type="button"
          onClick={() => void onShare()}
          className="inline-flex min-h-11 items-center font-sans text-[0.68rem] tracking-[0.16em] text-feather uppercase hover:text-ink"
        >
          Share
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex min-h-11 items-center font-sans text-[0.68rem] tracking-[0.16em] text-feather uppercase hover:text-ink"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </span>
  );
}
