import { cn } from "@/lib/utils";

export function PageHero({
  kicker,
  title,
  dek,
  image,
  imageAlt,
  imagePosition = "center",
  compact,
}: {
  kicker: string;
  title: string;
  dek?: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: "top" | "center";
  compact?: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-rule">
      {image ? (
        <img
          src={image}
          alt={imageAlt ?? ""}
          className={cn(
            "absolute inset-0 size-full object-cover",
            imagePosition === "top" && "object-top",
          )}
        />
      ) : null}
      <div
        className={cn(
          "absolute inset-0",
          image
            ? "bg-linear-to-t from-ink via-ink/78 to-ink/35"
            : "bg-ink-soft",
        )}
      />
      <div
        className={cn(
          "relative mx-auto max-w-4xl px-4 sm:px-6",
          compact ? "py-10 sm:py-12" : "py-16 sm:py-20",
        )}
      >
        <p className="kicker stagger-in">{kicker}</p>
        <h1 className="stagger-in mt-3 font-display text-3xl leading-[1.05] font-semibold text-paper sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {dek ? (
          <p className="stagger-in mt-5 max-w-2xl font-display text-lg leading-relaxed text-fog sm:text-xl">
            {dek}
          </p>
        ) : null}
      </div>
    </section>
  );
}
