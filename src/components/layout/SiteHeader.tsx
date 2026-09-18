import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { SpiritMark } from "@/components/SpiritMark";
import { nav } from "@/data/nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-rule/80 bg-ink/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-end px-4 sm:h-[4.25rem] sm:px-6">
        <Link
          to="/"
          aria-label="Spirit of Martinez"
          className="absolute inset-y-0 left-1/2 z-10 flex min-h-11 min-w-[4.5rem] -translate-x-1/2 items-center justify-center px-3"
          onClick={() => setOpen(false)}
        >
          <SpiritMark className="h-10 w-auto text-brass sm:h-11" />
        </Link>

        <button
          type="button"
          className="relative z-20 flex size-11 shrink-0 items-center justify-center text-paper lg:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <nav
        className="hidden border-t border-rule/60 lg:block"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-0.5 px-4 sm:px-6">
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
        </div>
      </nav>

      {open ? (
        <nav
          id="site-menu"
          className="border-t border-rule bg-ink-soft px-4 py-3 lg:hidden"
          aria-label="Primary"
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
