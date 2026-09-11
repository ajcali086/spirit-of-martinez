import { crewRecordLinks } from "@/data/crew";
import type { CrewMember, RecordLink } from "@/data/types";
import { cn } from "@/lib/utils";

function isInternal(href: string) {
  return href.startsWith("/");
}

function RecordAnchor({
  record,
  compact,
}: {
  record: RecordLink;
  compact?: boolean;
}) {
  const className = compact
    ? "inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-brass uppercase hover:text-paper"
    : "flex min-h-11 flex-col justify-center py-4 text-brass hover:text-paper";
  const body = compact ? (
    record.label
  ) : (
    <>
      <span className="text-[0.68rem] tracking-[0.16em] uppercase">
        {record.label}
      </span>
      <span className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
        {record.note}
      </span>
    </>
  );

  if (isInternal(record.href)) {
    return (
      <a href={record.href} className={className}>
        {body}
      </a>
    );
  }

  return (
    <a
      href={record.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {body}
    </a>
  );
}

export function CrewRecords({
  member,
  compact,
}: {
  member: CrewMember;
  compact?: boolean;
}) {
  const links = crewRecordLinks(member);

  if (compact) {
    return (
      <ul className="mt-3 flex flex-col">
        {links.map((r) => (
          <li key={r.href}>
            <RecordAnchor record={r} compact />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="font-sans text-[0.68rem] tracking-[0.22em] text-brass uppercase">
        In the record
      </h2>
      <ul className="mt-4 divide-y divide-rule border-y border-rule">
        {links.map((r) => (
          <li key={r.href} className={cn("border-rule")}>
            <RecordAnchor record={r} />
          </li>
        ))}
      </ul>
    </section>
  );
}