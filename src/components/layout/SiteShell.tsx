import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { BackToTop, ReadingProgress, SkipLink } from "./ReadingChrome";
import { useBookAudio } from "./BookAudio";

export function SiteShell({ children }: { children: ReactNode }) {
  const { track } = useBookAudio();

  return (
    <div className="flex min-h-dvh flex-col bg-ink">
      <SkipLink />
      <ReadingProgress />
      <SiteHeader />
      {track ? (
        <div data-player-spacer className="h-[4.75rem] shrink-0 sm:h-12" aria-hidden />
      ) : null}
      <div id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </div>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
