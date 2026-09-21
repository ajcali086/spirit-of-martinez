import { webpSrcSet, SIZES } from "@/lib/srcset";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "eager" | "lazy";
  decoding?: "async" | "sync" | "auto";
  sizes?: string;
};

/** JPEG + WebP from the intake compressor. `src` may include an extension. */
export function SiteImage({
  src,
  alt,
  className,
  width,
  height,
  fetchPriority,
  loading = fetchPriority === "high" ? "eager" : "lazy",
  decoding = "async",
  sizes = SIZES.banner,
}: Props) {
  const base = src.replace(/\.(jpe?g|png|webp)$/i, "");
  const srcSet = webpSrcSet(src);
  return (
    <picture className="contents">
      <source
        srcSet={srcSet ?? `${base}.webp`}
        type="image/webp"
        sizes={srcSet ? sizes : undefined}
      />
      <img
        src={`${base}.jpg`}
        alt={alt}
        className={className}
        width={width}
        height={height}
        fetchPriority={fetchPriority}
        loading={loading}
        decoding={decoding}
        sizes={srcSet ? sizes : undefined}
      />
    </picture>
  );
}
