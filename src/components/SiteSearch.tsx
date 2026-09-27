import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { excerpt } from "@/lib/search/excerpt";
import { isTypingTarget, normalizeWithMap } from "@/lib/search/normalize";
import { flattenHits, resultCount, searchRecords } from "@/lib/search/query";
import type { SearchRecord } from "@/lib/search/types";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 150;

function loadIndex() {
  return import("@/generated/search-index.json").then((mod) => mod.default as SearchRecord[]);
}

function Marked({ text, query }: { text: string; query: string }) {
  const q = normalizeWithMap(query).text;
  if (q.length < 2) return <>{text}</>;
  const { text: norm, map } = normalizeWithMap(text);
  const at = norm.indexOf(q);
  if (at < 0) return <>{text}</>;
  const start = map[at];
  const end = map[at + q.length - 1] + 1;
  return (
    <>
      {text.slice(0, start)}
      <mark className="bg-brass/25 text-inherit">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}

export function SiteSearch({
  onEngage,
  onActive,
}: {
  onEngage?: () => void;
  onActive?: (active: boolean) => void;
}) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const listId = useId();
  const desktopRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const phoneDialogRef = useRef<HTMLDivElement>(null);
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const [raw, setRaw] = useState("");
  const [debounced, setDebounced] = useState("");
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [active, setActive] = useState(0);
  const asked = useRef(false);

  function ensure() {
    if (asked.current) return;
    asked.current = true;
    void loadIndex().then(setRecords);
  }

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(raw), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [raw]);

  useEffect(() => {
    setPhoneOpen(false);
    setDesktopOpen(false);
    setRaw("");
    setDebounced("");
  }, [pathname]);

  const groups = useMemo(
    () => (records ? searchRecords(records, debounced) : []),
    [records, debounced],
  );
  const flat = useMemo(() => flattenHits(groups), [groups]);
  const q = normalizeWithMap(debounced).text;
  const waiting = q.length >= 2 && !records;
  const noHits = q.length >= 2 && records != null && groups.length === 0;
  const showDesktop = desktopOpen && q.length >= 2;
  const showPhoneResults = phoneOpen && q.length >= 2;

  useEffect(() => {
    setActive(0);
  }, [debounced]);

  useEffect(() => {
    onActive?.(phoneOpen || showDesktop);
  }, [phoneOpen, showDesktop, onActive]);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target as HTMLElement)) return;
      e.preventDefault();
      ensure();
      onEngage?.();
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      if (wide) {
        setDesktopOpen(true);
        desktopRef.current?.focus();
      } else {
        setPhoneOpen(true);
        window.setTimeout(() => phoneRef.current?.focus(), 0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEngage]);

  useEffect(() => {
    if (!showDesktop) return;
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setDesktopOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [showDesktop]);

  function go(href: string) {
    setPhoneOpen(false);
    setDesktopOpen(false);
    void router.navigate({ href });
  }

  function onPanelKey(e: { key: string; preventDefault: () => void; shiftKey: boolean }, dialog: HTMLElement | null) {
    if (e.key === "Escape") {
      e.preventDefault();
      setPhoneOpen(false);
      setDesktopOpen(false);
      (phoneOpen ? phoneRef : desktopRef).current?.focus();
      return;
    }
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && flat.length) {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const next = (active + dir + flat.length) % flat.length;
      setActive(next);
      document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active].href);
      return;
    }
    if (e.key === "Tab" && dialog) {
      const nodes = [...dialog.querySelectorAll<HTMLElement>("a[href], button, input")].filter(
        (el) => el.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  const count = resultCount(groups);
  const announcement = noHits
    ? `Nothing in the record matches "${raw.trim()}".`
    : q.length >= 2 && records
      ? `${count} ${count === 1 ? "result" : "results"}`
      : "";

  const results = (labeled: boolean) => (
    <div className="flex min-h-0 flex-1 flex-col">
      {waiting ? null : noHits ? (
        <p className="px-4 py-8 font-display text-xl text-paper" role="status">
          Nothing in the record matches “{raw.trim()}”.
        </p>
      ) : groups.length ? (
        <>
          <div
            id={listId}
            role="listbox"
            aria-label="Search results"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3"
          >
            {groups.map((group) => (
              <section key={group.id} className="mb-5 last:mb-0">
                <h2 className="kicker">
                  {group.label} · {group.total}
                </h2>
                <ul className="mt-2">
                  {group.hits.map((hit) => {
                    const index = flat.indexOf(hit);
                    const window = excerpt(hit.body, debounced);
                    return (
                      <li key={`${hit.href}-${hit.order}`}>
                        <a
                          id={`${listId}-${index}`}
                          role="option"
                          aria-selected={index === active}
                          href={hit.href}
                          className={cn(
                            "flex min-h-11 flex-col justify-center border-b border-rule/50 py-2.5 outline-none",
                            index === active && "border-brass/40",
                          )}
                          onMouseEnter={() => setActive(index)}
                          onClick={(e) => {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                            e.preventDefault();
                            go(hit.href);
                          }}
                        >
                          <span className="font-sans text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                            {hit.type}
                          </span>
                          <span className="mt-0.5 flex items-baseline justify-between gap-3">
                            <span className="font-display text-xl text-paper">
                              <Marked text={hit.title} query={debounced} />
                            </span>
                            {hit.chip ? (
                              <span className="shrink-0 font-sans text-[0.62rem] tracking-[0.14em] text-brass uppercase">
                                {hit.group === "chapters" ? `¶ ${hit.chip}` : hit.group === "missions" ? `#${hit.chip}` : hit.chip}
                              </span>
                            ) : null}
                          </span>
                          {window.text ? (
                            <span className="mt-1 line-clamp-3 text-sm leading-relaxed text-fog">
                              {window.markStart >= 0 ? (
                                <>
                                  {window.text.slice(0, window.markStart)}
                                  <mark className="bg-brass/25 text-paper">
                                    {window.text.slice(window.markStart, window.markEnd)}
                                  </mark>
                                  {window.text.slice(window.markEnd)}
                                </>
                              ) : (
                                window.text
                              )}
                            </span>
                          ) : null}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule/70 px-4 py-2">
            <p className="font-sans text-[0.62rem] tracking-[0.14em] text-fog uppercase" aria-live="polite">
              {announcement}
            </p>
            {labeled ? (
              <p className="font-sans text-[0.62rem] tracking-[0.12em] text-muted">
                ↑↓ to move · ↵ to open · esc to close
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex size-11 items-center justify-center text-paper lg:hidden"
        aria-label="Search the archive"
        aria-expanded={phoneOpen}
        aria-controls={phoneOpen ? "site-search-dialog" : undefined}
        onClick={() => {
          ensure();
          onEngage?.();
          setPhoneOpen(true);
          window.setTimeout(() => phoneRef.current?.focus(), 0);
        }}
      >
        <Search className="size-5" />
      </button>

      <div className="hidden lg:block">
        <input
          ref={desktopRef}
          type="text"
          value={raw}
          placeholder="Search the archive"
          aria-label="Search the archive"
          aria-expanded={showDesktop}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showDesktop && flat[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-56 border-b border-rule bg-transparent text-sm text-paper outline-none placeholder:text-muted focus:border-brass"
          onFocus={() => {
            ensure();
            onEngage?.();
            setDesktopOpen(true);
          }}
          onChange={(e) => {
            ensure();
            setRaw(e.target.value);
            setDesktopOpen(true);
          }}
          onKeyDown={(e) => onPanelKey(e, rootRef.current)}
        />
        {showDesktop ? (
          <div
            role="dialog"
            aria-label="Search the archive"
            className="absolute top-[calc(100%+0.5rem)] left-0 z-30 flex max-h-[min(32rem,70vh)] w-[min(36rem,calc(100vw-2rem))] flex-col border border-rule bg-ink shadow-2xl"
          >
            {results(true)}
          </div>
        ) : null}
      </div>

      {phoneOpen
        ? createPortal(
            <div
              ref={phoneDialogRef}
              id="site-search-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Search the archive"
              className="fixed inset-0 z-[80] flex flex-col bg-ink lg:hidden"
              onKeyDown={(e) => onPanelKey(e, phoneDialogRef.current)}
            >
              <div className="flex items-center gap-2 border-b border-rule px-4">
                <Search className="size-4 shrink-0 text-brass" aria-hidden />
                <input
                  ref={phoneRef}
                  type="text"
                  value={raw}
                  placeholder="Search the archive"
                  aria-label="Search the archive"
                  aria-expanded={showPhoneResults}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={
                    showPhoneResults && flat[active] ? `${listId}-${active}` : undefined
                  }
                  autoComplete="off"
                  spellCheck={false}
                  className="h-14 min-w-0 flex-1 bg-transparent text-base text-paper outline-none placeholder:text-muted"
                  onChange={(e) => {
                    ensure();
                    setRaw(e.target.value);
                  }}
                />
                <button
                  type="button"
                  className="flex size-11 items-center justify-center text-paper"
                  aria-label="Close search"
                  onClick={() => {
                    setPhoneOpen(false);
                    setDesktopOpen(false);
                  }}
                >
                  <X className="size-5" />
                </button>
              </div>
              {results(true)}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
