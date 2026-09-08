import { photos } from "@/data/photos";
import type { PhotoId } from "@/data/types";
import { cn } from "@/lib/utils";

export function PhotoPlate({
  id,
  caption,
  tone = "ink",
  priority = false,
  constrain = true,
  className,
}: {
  id: PhotoId;
  caption?: string;
  tone?: "ink" | "paper";
  priority?: boolean;
  constrain?: boolean;
  className?: string;
}) {
  const photo = photos[id];
  const text = caption ?? photo.caption;
  const portrait = photo.height > photo.width;
  const widthClass =
    photo.maxWidth === "sm"
      ? "mx-auto w-full max-w-sm"
      : photo.maxWidth === "lg"
        ? "mx-auto w-full max-w-lg"
        : photo.maxWidth === "xl"
          ? "w-full"
          : constrain && portrait
            ? "mx-auto w-full max-w-lg"
            : undefined;

  return (
    <figure className={cn("my-8", widthClass, className)}>
      <picture>
        <source srcSet={`${photo.src}.webp`} type="image/webp" />
        <img
          src={`${photo.src}.jpg`}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          sizes={
            photo.maxWidth === "sm"
              ? "(min-width: 640px) 24rem, 100vw"
              : photo.maxWidth === "xl"
                ? "(min-width: 1024px) 56rem, 100vw"
                : widthClass
                  ? "(min-width: 640px) 32rem, 100vw"
                  : "(min-width: 1024px) 56rem, 100vw"
          }
          className="h-auto w-full bg-ink-mid"
        />
      </picture>
      <figcaption
        className={cn(
          "mt-3 font-sans text-sm leading-relaxed",
          tone === "paper" ? "text-ink-soft/80" : "text-muted",
        )}
      >
        {text}
        <span
          className={cn(
            "mt-1 block text-xs tracking-widest uppercase",
            tone === "paper" ? "text-brass-dim" : "text-brass",
          )}
        >
          {photo.credit}
        </span>
      </figcaption>
    </figure>
  );
}
