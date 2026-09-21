import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import {
  chapterBySlug,
  retiredChapterSlugs,
} from "@/data/chapters";
import { pageMeta, bannerOgImage } from "@/lib/og/pageMeta";

const ChapterPage = lazy(() =>
  import("./chapters.slug.page").then((m) => ({ default: m.ChapterPage })),
);

export const Route = createFileRoute("/chapters/$slug")({
  beforeLoad: ({ params }) => {
    const dest = retiredChapterSlugs[params.slug];
    if (dest) {
      throw redirect({
        to: "/chapters/$slug",
        params: { slug: dest },
      });
    }
    if (!chapterBySlug(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const chapter = chapterBySlug(params.slug);
    if (!chapter) return {};
    return pageMeta({
      title: `Chapter ${chapter.number} — ${chapter.title} · The Spirit of Martinez`,
      description: chapter.dek,
      path: `/chapters/${chapter.slug}`,
      ...bannerOgImage(chapter.image, chapter.imageAlt),
    });
  },
  component: function ChapterRoute() {
    return (
      <Suspense fallback={null}>
        <ChapterPage />
      </Suspense>
    );
  },
});
