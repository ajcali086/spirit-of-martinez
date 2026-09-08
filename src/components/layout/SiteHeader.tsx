import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { SpiritMark } from "@/components/SpiritMark";
import { nav } from "@/data/nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-rule/80 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2.5 text-paper transition-opacity hover:opacity-80"
          onClick={() => setOpen(false)}
        >
          <SpiritMark className="size-8 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.15rem] font-semibold tracking-tight">
              Spirit of Martinez
            </span>
            <span className="mt-0.5 text-[0.62rem] tracking-[0.18em] text-muted uppercase">
              What a Family Kept
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "min-h-11 px-3 py-2 text-[0.78rem] tracking-[0.14em] uppercase transition-colors",
                  active ? "text-brass" : "text-fog hover:text-paper",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="relative flex size-11 items-center justify-center text-paper lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <nav
          className="border-t border-rule bg-ink-soft px-4 py-3 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="flex min-h-12 items-center border-b border-rule/60 text-sm tracking-[0.16em] text-paper uppercase"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
