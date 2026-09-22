import { createFileRoute, Link, notFound, redirect, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Headphones, Play } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { useBookAudio, type ChapterTrack } from "@/components/layout/BookAudio";
import { PhotoPlate } from "@/components/PhotoPlate";
import { PassageDoor } from "@/components/PassageDoor";
import { useDoorDeconflict } from "@/components/useDoorDeconflict";
import { CiteThis } from "@/components/CiteThis";
import { ContinueTracker } from "@/components/ContinueTracker";
import { SiteImage } from "@/components/SiteImage";
import { useReadingFollow } from "@/components/ReadingFollow";
import {
  adjacentChapters,
  chapterBySlug,
  chapters,
  citeChapter,
  FIGURE_MISSION,
  retiredChapterSlugs,
} from "@/data/chapters";
import { chapterCues } from "@/data/cues";
import { hasChapterMoments, loadChapterMoments } from "@/lib/chapterMoments";
import { photos } from "@/data/photos";
import { shownInlineFigures } from "@/lib/figureLayout";
import { parseStartParam } from "@/lib/passageShare";
import { sectionSeeksFor, type SectionSeek } from "@/data/sectionSeeks";
import type { Block, Chapter, PhotoId, Section } from "@/data/types";
import { pageMeta, bannerOgImage } from "@/lib/og/pageMeta";
import { readPlace, writePlace } from "@/lib/bookmark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chapters/$slug")({
  validateSearch: (search: Record<string, unknown>): { t?: number } => {
    const t = parseStartParam(search.t);
    return t == null ? {} : { t };
  },
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
  loader: async ({ params }) => ({
    moments: await loadChapterMoments(params.slug),
  }),
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
  component: ChapterPage,
});

function ChapterPage() {
  const { slug } = Route.useParams();
  const { moments: loaded } = Route.useLoaderData();
  const startAt = Route.useSearch({ select: (s) => s.t });
  const navigate = Route.useNavigate();
  const [moments, setMoments] = useState(loaded);
  const hash = useRouterState({ select: (s) => s.location.hash });
  const { offer, play, playFrom, track, dockedChapter } = useBookAudio();
  const { activeId } = useReadingFollow(slug);
  const chapter = chapterBySlug(slug);
  useDoorDeconflict(slug);

  useEffect(() => {
    setMoments(loaded);
  }, [loaded, slug]);

  useEffect(() => {
    if (moments?.cues.length) return;
    if (!hasChapterMoments(slug)) return;
    let cancelled = false;
    void loadChapterMoments(slug).then((m) => {
      if (!cancelled && m) setMoments(m);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, moments]);

  useLayoutEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id) return;
    const go = () =>
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    go();
    requestAnimationFrame(go);
  }, [hash, slug]);

  useEffect(() => {
    if (!chapter?.audio) return;
    const next: ChapterTrack = {
      kind: "chapter",
      src: chapter.audio,
      title: chapter.title,
      number: chapter.number,
      slug: chapter.slug,
    };
    if (startAt == null) {
      offer(next);
      return;
    }
    playFrom(next, startAt);
    const fragment =
      typeof window !== "undefined"
        ? window.location.hash.replace(/^#/, "")
        : "";
    void navigate({
      search: {},
      hash: fragment || true,
      replace: true,
    });
  }, [chapter, offer, playFrom, startAt, navigate]);

  useEffect(() => {
    if (!chapter) return;
    const prev = readPlace();
    writePlace({
      slug: chapter.slug,
      number: chapter.number,
      title: chapter.title,
      time: prev?.slug === chapter.slug ? prev.time : 0,
      ended: prev?.slug === chapter.slug ? prev.ended : false,
    });
  }, [chapter]);

  if (!chapter) {
    throw notFound();
  }
  const { prev, next } = adjacentChapters(slug);
  const cite = citeChapter(chapter);
  const seeks = chapter.audio
    ? sectionSeeksFor(chapter, moments?.cues)
    : undefined;
  let firstPara = true;
  const thisChapter =
    track?.kind === "chapter" && track.slug === chapter.slug;
  const thisDocked = dockedChapter?.slug === chapter.slug;
  const occupied =
    (track?.kind === "chapter" && track.slug !== chapter.slug) ||
    (dockedChapter != null && dockedChapter.slug !== chapter.slug) ||
    track?.kind === "music";

  return (
    <SiteShell>
      <ContinueTracker kind="chapter" slug={chapter.slug} />
      <article>
        <header className="relative overflow-hidden border-b border-rule">
          <SiteImage
            src={chapter.image}
            alt={chapter.imageAlt}
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
            className={cn(
              "absolute inset-0 size-full object-cover",
              chapter.imagePosition === "top" && "object-top",
            )}
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/80 to-ink/30" />
          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <p
              data-cue="ch-num"
              className={cn("kicker", activeId === "ch-num" && "is-reading")}
            >
              Chapter {chapter.number} · {chapter.years}
            </p>
            <h1
              data-cue="ch-title"
              className={cn(
                "mt-4 font-display text-4xl leading-[1.05] font-semibold text-paper sm:text-6xl",
                activeId === "ch-title" && "is-reading",
              )}
            >
              {chapter.title}
            </h1>
            <p
              data-cue="ch-kicker"
              className={cn(
                "mt-4 font-display text-lg text-fog italic",
                activeId === "ch-kicker" && "is-reading",
              )}
            >
              {chapter.kicker}
            </p>
            {chapter.audio && occupied && !thisChapter && !thisDocked ? (
              <button
                type="button"
                onClick={() =>
                  play({
                    kind: "chapter",
                    src: chapter.audio!,
                    title: chapter.title,
                    number: chapter.number,
                    slug: chapter.slug,
                  })
                }
                className="mt-6 inline-flex min-h-12 items-center gap-2 border border-fog/40 px-5 text-sm tracking-[0.12em] text-paper uppercase hover:border-brass hover:text-brass"
              >
                <Headphones className="size-4" aria-hidden />
                Listen to this chapter
              </button>
            ) : null}
          </div>
        </header>

        <nav
          aria-label="Chapters"
          className="sticky top-[calc(4rem+var(--player-h,0px))] z-30 border-b border-paper-deep/40 bg-paper"
        >
          <div className="relative">
            <ol className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3 py-2">
              {chapters.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/chapters/$slug"
                    params={{ slug: c.slug }}
                    className={`flex size-11 items-center justify-center font-display text-sm ${
                      c.slug === slug
                        ? "bg-ink text-paper"
                        : "text-ink-soft hover:text-ink"
                    }`}
                    aria-current={c.slug === slug ? "page" : undefined}
                    aria-label={`Chapter ${c.number}: ${c.title}`}
                  >
                    {c.number}
                  </Link>
                </li>
              ))}
            </ol>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-paper"
              aria-hidden
            />
          </div>
        </nav>

        <div className="bg-paper">
          <div
            data-continue-root="chapter"
            className="prose-archive mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16"
          >
            <p className="mb-10 font-sans text-[0.72rem] leading-relaxed tracking-[0.14em] text-brass-dim uppercase">
              {chapter.dek}
            </p>
            {chapter.sections.some((s) => s.title) ? (
              <nav aria-label="In this chapter" className="mb-10">
                <p className="font-sans text-[0.62rem] tracking-[0.18em] text-muted uppercase">
                  In this chapter
                </p>
                <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {chapter.sections
                    .filter((s) => s.title)
                    .map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="inline-flex min-h-11 items-center font-sans text-[0.78rem] tracking-[0.12em] text-ink-soft underline-offset-4 hover:text-feather hover:underline"
                        >
                          {s.id}
                          <span className="ml-1.5 text-ink">{s.title}</span>
                        </a>
                      </li>
                    ))}
                </ol>
              </nav>
            ) : null}
            {chapter.audio ? (
              <p className="mb-10 font-sans text-sm leading-relaxed text-ink-soft/80">
                A synthetic reading of this chapter is in the bar at the top. It
                will keep playing while you move through the book. The text
                below is the transcript.
                {chapterCues[slug] || hasChapterMoments(slug)
                  ? " The voice’s place on the page is marked as it reads."
                  : ""}
              </p>
            ) : null}
            {["mission-one", "ninety-four-hours", "borrowed-aircraft", "utrecht"].includes(
              slug,
            ) ? (
              <p className="mb-10 font-sans text-sm leading-relaxed text-ink-soft/80">
                These mornings also sit on the{" "}
                <Link
                  to="/missions"
                  className="text-feather underline-offset-4 hover:underline"
                >
                  mission board
                </Link>
                .
              </p>
            ) : null}
            {chapter.sections.map((section) => {
              let pIndex = 0;
              const plateDoors = new Map<string, PhotoId[]>();
              let lastP: string | undefined;
              for (const b of section.blocks) {
                if (b.type === "p" && b.id) lastP = b.id;
                if (b.type === "figure" && lastP) {
                  const list = plateDoors.get(lastP) ?? [];
                  list.push(b.id);
                  plateDoors.set(lastP, list);
                }
              }
              const shownPlates = shownInlineFigures(
                chapter.number,
                section.blocks,
                (id) => photos[id].kind,
              );
              return (
              <section
                key={section.id}
                id={section.id}
                className="mb-14 scroll-mt-28"
              >
                {section.title ? (
                  <header className="mb-6">
                    <p
                      data-cue={`sec-${section.id}-id`}
                      className={cn(
                        "font-sans text-[0.68rem] tracking-[0.22em] text-feather uppercase",
                        activeId === `sec-${section.id}-id` && "is-reading",
                      )}
                    >
                      {section.id}
                    </p>
                    <h2
                      data-cue={`sec-${section.id}-title`}
                      className={cn(
                        "mt-2 font-display text-3xl text-ink",
                        activeId === `sec-${section.id}-title` && "is-reading",
                      )}
                    >
                      {seekButton(chapter, section, seeks, playFrom)}
                    </h2>
                    {section.place ? (
                      <p
                        data-cue={`sec-${section.id}-place`}
                        className={cn(
                          "mt-1 font-display text-base text-muted italic",
                          activeId === `sec-${section.id}-place` && "is-reading",
                        )}
                      >
                        {section.place}
                      </p>
                    ) : null}
                  </header>
                ) : null}
                {section.blocks.map((block, i) => {
                  let cueId: string | undefined;
                  if (block.type === "p") {
                    const positional = `${section.id}-p${pIndex++}`;
                    cueId = block.id?.startsWith("m-") ? positional : (block.id ?? positional);
                  }
                  const node = renderBlock(
                    block,
                    firstPara && block.type === "p",
                    cueId,
                    activeId,
                    block.type === "p" && block.id
                      ? plateDoors.get(block.id)
                      : undefined,
                    shownPlates,
                  );
                  if (firstPara && block.type === "p") firstPara = false;
                  return <div key={`${section.id}-${i}`}>{node}</div>;
                })}
              </section>
              );
            })}
            <CiteThis
              credit={cite.credit}
              title={cite.title}
              dated={cite.dated}
              work={cite.work}
              url={cite.url}
              displayUrl={cite.displayUrl}
              shareTitle={`Chapter ${chapter.number}, ${chapter.title} — The Spirit of Martinez`}
            />
          </div>
        </div>

        <nav className="border-t border-rule bg-ink-soft">
          <div className="mx-auto grid max-w-3xl gap-0 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/chapters/$slug"
                params={{ slug: prev.slug }}
                className="flex min-h-24 flex-col justify-center gap-1 border-b border-rule px-6 py-6 sm:border-r sm:border-b-0"
              >
                <span className="flex items-center gap-2 text-[0.68rem] tracking-[0.16em] text-fog uppercase">
                  <ArrowLeft className="size-3.5" /> Previous
                </span>
                <span className="font-display text-xl text-paper">{prev.title}</span>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {next ? (
              <Link
                to="/chapters/$slug"
                params={{ slug: next.slug }}
                className="flex min-h-24 flex-col justify-center gap-1 px-6 py-6 text-right"
              >
                <span className="flex items-center justify-end gap-2 text-[0.68rem] tracking-[0.16em] text-fog uppercase">
                  Next <ArrowRight className="size-3.5" />
                </span>
                <span className="font-display text-xl text-paper">{next.title}</span>
              </Link>
            ) : null}
          </div>
        </nav>
      </article>
    </SiteShell>
  );
}

function seekButton(
  chapter: Chapter,
  section: Section,
  seeks: SectionSeek[] | undefined,
  playFrom: (track: ChapterTrack, seconds: number) => void,
) {
  const seek = seeks?.find((s) => s.id === section.id);
  if (!seek || !chapter.audio) return section.title;
  return (
    <button
      type="button"
      className="seek"
      data-seek={String(seek.start)}
      aria-label={`Play reading from ${section.id}, ${section.title}`}
      onClick={() =>
        playFrom(
          {
            kind: "chapter",
            src: chapter.audio!,
            title: chapter.title,
            number: chapter.number,
            slug: chapter.slug,
          },
          seek.start,
        )
      }
    >
      <span>{section.title}</span>
      <Play className="seek-glyph" aria-hidden strokeWidth={1.75} />
    </button>
  );
}

function renderBlock(
  block: Block,
  dropCap: boolean,
  cueId?: string,
  activeId?: string | null,
  plates?: PhotoId[],
  shownPlates?: Set<PhotoId>,
) {
  if (block.type === "quote") {
    return (
      <blockquote className="quote-pull">
        {block.text}
        {block.cite ? (
          <footer className="mt-2 font-sans text-[0.68rem] tracking-[0.14em] text-muted not-italic uppercase">
            {block.cite}
          </footer>
        ) : null}
      </blockquote>
    );
  }
  if (block.type === "note") {
    return (
      <aside className="my-6 border border-brass/30 bg-paper-deep px-4 py-3 font-sans text-sm leading-relaxed text-ink-soft">
        {block.text}
      </aside>
    );
  }
  if (block.type === "artifact") {
    return (
      <aside className="my-6 border-l-2 border-feather bg-paper-deep/70 px-4 py-3">
        <p className="font-sans text-[0.68rem] tracking-[0.18em] text-feather uppercase">
          {block.title}
        </p>
        <p className="mt-1 font-display text-lg text-ink">{block.body}</p>
      </aside>
    );
  }
  if (block.type === "figure") {
    if (shownPlates && !shownPlates.has(block.id)) return null;
    const plate = <PhotoPlate id={block.id} caption={block.caption} tone="paper" />;
    const mission = FIGURE_MISSION[block.id];
    if (!mission) return plate;
    return (
      <div id={`m-${mission}`} className="scroll-mt-28">
        {plate}
      </div>
    );
  }
  const reading = Boolean(cueId && activeId === cueId);
  const missionNo = block.id?.match(/^m-(\d+)$/)?.[1];
  const paragraph = (
    <p
      id={block.id}
      data-cue={cueId}
      className={cn(
        dropCap && "drop-cap",
        block.id && "scroll-mt-28",
        cueId && "scroll-mt-28",
        reading && "is-reading",
      )}
    >
      {block.text}
    </p>
  );
  if (!missionNo && !plates?.length) return paragraph;
  return (
    <div className="group relative">
      {missionNo ? (
        <p className="mission-kicker">
          <Link to="/missions" hash={`m-${missionNo}`}>
            Mission {missionNo.padStart(2, "0")}
          </Link>
        </p>
      ) : null}
      {paragraph}
      {plates?.map((id) => {
        const mission = FIGURE_MISSION[id];
        const doorOnly = shownPlates ? !shownPlates.has(id) : false;
        return (
          <PassageDoor
            key={id}
            id={id}
            open={reading}
            anchor={doorOnly && mission ? `m-${mission}` : undefined}
          />
        );
      })}
    </div>
  );
}
