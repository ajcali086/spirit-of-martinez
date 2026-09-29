import { useEffect, useState } from "react";

export function useFloatingClearance() {
  const [scrolled, setScrolled] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 720);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const footer = document.getElementById("site-footer");
    const io = footer
      ? new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting), {
          threshold: 0.05,
        })
      : null;
    if (footer && io) io.observe(footer);
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  return { topVisible: scrolled && !footerInView, footerInView };
}
