import { Link } from "@tanstack/react-router";
import { SpiritMark } from "@/components/SpiritMark";
import { nav } from "@/data/nav";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule bg-ink-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-2">
            <SpiritMark className="size-6" />
            <p className="font-display text-xl text-paper">The Spirit of Martinez</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Assembled from a family’s collection, the 95th Bomb Group’s crew
            record, and the contemporary press. Where they disagree, the
            disagreement is stated. A descendant’s account of what a family kept.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.72rem] tracking-[0.16em] text-fog uppercase">
          {nav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="min-h-11 py-3 hover:text-brass"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-rule/70">
        <p className="mx-auto max-w-6xl px-4 py-4 text-[0.7rem] tracking-wide text-muted sm:px-6">
          Martinez, California · 335th Bomb Squadron, 95th Bomb Group · Station 119, Horham
        </p>
      </div>
    </footer>
  );
}