import { Link } from "@tanstack/react-router";
import { SiteShell } from "./SiteShell";

export function NotFound() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="kicker">Station unknown</p>
        <h1 className="mt-4 font-display text-4xl text-paper">Nothing on the board</h1>
        <p className="mt-4 text-fog">
          That page is not in the collection. The record stops where it stops.
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
