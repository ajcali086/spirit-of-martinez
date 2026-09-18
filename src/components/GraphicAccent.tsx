import { cn } from "@/lib/utils";

/** Decorative reconstruction — not a wartime photograph. */
export function GraphicAccent({
  name,
  width,
  height,
  className,
}: {
  name: "ship" | "tally";
  width: number;
  height: number;
  className?: string;
}) {
  const src = `/images/marks/${name}`;
  return (
    <picture className="flex justify-center">
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
