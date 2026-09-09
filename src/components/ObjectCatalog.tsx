import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { photoList } from "@/data/photos";
import type { PhotoKind } from "@/data/photos";
import { cn } from "@/lib/utils";

type Filter = "all" | PhotoKind;

export function ObjectCatalog() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return photoList.filter((p) => {
      if (filter !== "all" && p.kind !== filter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.caption.toLowerCase().includes(q) ||
        p.alt.toLowerCase().includes(q) ||
        p.credit.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Kind">
          {(
            [
              ["all", "All"],
              ["photograph", "Photographs"],
              ["object", "Objects"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "min-h-11 px-3 text-[0.72rem] tracking-[0.16em] uppercase",
                filter === value
                  ? "bg-ink text-paper"
                  : "border border-paper-deep text-ink-soft hover:border-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="block sm:w-72">
          <span className="font-sans text-[0.68rem] tracking-[0.18em] text-feather uppercase">
            Search the collection
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caption, what is visible, credit"
            className="mt-1 min-h-11 w-full border border-paper-deep bg-paper px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-ink"
          />
        </label>
      </div>

      {results.length === 0 ? (
        <p className="mt-12 font-display text-xl text-ink">
          The collection is what a family kept, not what a researcher would have
          chosen.
        </p>
      ) : (
        <ul className="mt-10 grid gap-px border border-paper-deep bg-paper-deep sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <li key={p.id} className="bg-paper">
              <Link
                to="/archive/$id"
                params={{ id: p.id }}
                className="group flex h-full flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-ink-mid">
                  <picture>
                    <source srcSet={`${p.src}.webp`} type="image/webp" />
                    <img
                      src={`${p.src}.jpg`}
                      alt={p.alt}
                      width={p.width}
                      height={p.height}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover outline-none transition-opacity group-hover:opacity-90"
                    />
                  </picture>
                </div>
                <div className="flex flex-1 flex-col px-4 py-4">
                  <p className="font-sans text-[0.62rem] tracking-[0.18em] text-feather uppercase">
                    {p.kind === "photograph" ? "Photograph" : "Object"}
                    {p.date ? ` · ${p.date}` : ""}
                  </p>
                  <p className="mt-2 font-display text-lg leading-snug text-ink group-hover:text-brass-dim">
                    {p.title}
                  </p>
                  <p className="mt-auto pt-3 text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                    {p.credit}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[0.68rem] tracking-[0.14em] text-muted uppercase">
        {results.length} of {photoList.length}
      </p>
    </div>
  );
}
