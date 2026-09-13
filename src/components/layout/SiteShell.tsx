import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { useBookAudio } from "./BookAudio";

export function SiteShell({ children }: { children: ReactNode }) {
  const { track } = useBookAudio();

  return (
    <div className="flex min-h-dvh flex-col bg-ink">
      <SiteHeader />
      {track ? <div className="h-12 shrink-0" aria-hidden /> : null}
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}