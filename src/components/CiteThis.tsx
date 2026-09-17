import { CopyLink } from "@/components/CopyLink";

export function CiteThis({
  credit,
  title,
  dated = "",
  work,
  url,
  displayUrl,
  shareTitle,
}: {
  credit: string;
  title: string;
  dated?: string;
  work: string;
  url: string;
  displayUrl: string;
  shareTitle: string;
}) {
  return (
    <section className="mt-10 border-t border-paper-deep pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase">
          Cite this
        </h2>
        <CopyLink url={url} title={shareTitle} />
      </div>
      <p className="mt-3 font-display text-lg leading-relaxed text-ink-soft">
        {credit}. <em>{title}</em>
        {dated}. {work}.
      </p>
      <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
        {displayUrl}
      </p>
    </section>
  );
}
