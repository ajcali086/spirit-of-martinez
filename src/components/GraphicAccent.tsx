import { cn } from "@/lib/utils";
import { SIZES, webpSrcSet } from "@/lib/srcset";

/** Decorative reconstruction — not a wartime photograph. */
export function GraphicAccent({
  name,
  width,
  height,
  className,
  align = "center",
}: {
  name: "ship" | "tally";
  width: number;
  height: number;
  className?: string;
  align?: "center" | "start";
}) {
  const src = `/images/marks/${name}`;
  const srcSet = webpSrcSet(src);
  const sizes = name === "tally" ? SIZES.tally : SIZES.ship;
  return (
    <picture
      className={cn("flex", align === "start" ? "justify-center md:justify-start" : "justify-center")}
    >
      <source
        srcSet={srcSet ?? `${src}.webp`}
        type="image/webp"
        sizes={srcSet ? sizes : undefined}
      />
      <img
        src={`${src}.png`}
        alt=""
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        aria-hidden="true"
        sizes={srcSet ? sizes : undefined}
        className={cn("bg-transparent outline-none select-none", className)}
      />
    </picture>
  );
}
