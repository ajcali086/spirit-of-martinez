type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "eager" | "lazy";
  decoding?: "async" | "sync" | "auto";
};

/** JPEG + WebP from the intake compressor. `src` may include an extension. */
export function SiteImage({
  src,
  alt,
  className,
  width,
  height,
  fetchPriority,
  loading,
  decoding = "async",
}: Props) {
  const base = src.replace(/\.(jpe?g|png|webp)$/i, "");
  return (
    <picture className="contents">
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.jpg`}
        alt={alt}
        className={className}
        width={width}
        height={height}
        fetchPriority={fetchPriority}
        loading={loading}
        decoding={decoding}
      />
    </picture>
  );
}
