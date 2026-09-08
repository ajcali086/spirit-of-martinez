import { cn } from "@/lib/utils";

export function SpiritMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill="#141210" />
      <rect x="2.6" y="12" width="26.8" height="8" fill="#f3ead6" />
      <rect x="2.6" y="14.7" width="26.8" height="2.6" fill="#8e3a32" />
      <circle cx="16" cy="16" r="8.2" fill="#1a3d73" />
      <path
        fill="#f3ead6"
        d="M16 9 L17.73 13.61 22.66 13.84 18.81 16.91 20.11 21.66 16 18.95 11.89 21.66 13.19 16.91 9.34 13.84 14.27 13.61 Z"
      />
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="5.5"
        fill="none"
        stroke="#b8954a"
        strokeWidth="1.25"
      />
    </svg>
  );
}
