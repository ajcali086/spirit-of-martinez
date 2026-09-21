import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";

export function AppErrorComponent({ error: _error }: ErrorComponentProps) {
  return (
    <SiteShell>
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="kicker">The board went dark</p>
        <h1 className="mt-4 font-display text-4xl text-paper">
          Something went wrong
        </h1>
        <p className="mt-4 text-fog">
          That page could not be shown. The rest of the collection is still
          here.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-12 items-center bg-brass px-5 text-sm tracking-[0.14em] text-ink uppercase"
        >
          Return home
        </Link>
      </main>
    </SiteShell>
  );
}