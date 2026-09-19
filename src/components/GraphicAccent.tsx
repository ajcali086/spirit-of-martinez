import { cn } from "@/lib/utils";

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
  return (
    <picture
      className={cn("flex", align === "start" ? "justify-center md:justify-start" : "justify-center")}
    >
      <source srcSet={`${src}.webp`} type="image/webp" />
      <img
        src={`${src}.png`}
        alt=""
        width={width}
        height={height}
        decoding="async"
        aria-hidden="true"
        className={cn("bg-transparent outline-none select-none", className)}
      />
    </picture>
  );
}
