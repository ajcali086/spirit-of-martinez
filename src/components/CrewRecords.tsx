import { crewRecordLinks } from "@/data/crew";
import type { CrewMember } from "@/data/types";
import { cn } from "@/lib/utils";

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
            <a
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-[0.68rem] tracking-[0.16em] text-brass uppercase hover:text-paper"
            >
              {r.label}
            </a>
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
          <li key={r.href}>
            <a
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex min-h-11 flex-col justify-center py-4 text-brass hover:text-paper",
              )}
            >
              <span className="text-[0.68rem] tracking-[0.16em] uppercase">
                {r.label}
              </span>
              <span className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                {r.note}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
