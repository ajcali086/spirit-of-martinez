import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Pause, Play, X, Music2 } from "lucide-react";
import { chapterCues } from "@/data/cues";
import { sentenceCues } from "@/data/sentenceCues";
import { readPlace, writePlace } from "@/lib/bookmark";
import { isAacSrc, pickChapterAudio } from "@/lib/chapterAudio";

export type ChapterTrack = {
  kind: "chapter";
  src: string;
  title: string;
  number: number;
  slug: string;
};

export type MusicTrack = {
  kind: "music";
  src: string;
  title: string;
};

export type AudioTrack = ChapterTrack | MusicTrack;

export const SKYWATCH: MusicTrack = {
  kind: "music",
  src: "/audio/skywatch-silence.mp3",
  title: "Skywatch Silence",
};

const MUSIC_VOLUME = 0.22;
const CHAPTER_VOLUME = 1;

type ChapterResume = {
  track: ChapterTrack;
  time: number;
  ended: boolean;
  wasPlaying: boolean;
};

type BookAudioValue = {
  track: AudioTrack | null;
  playing: boolean;
  ended: boolean;
  time: number;
  follow: boolean;
  setFollow: (value: boolean) => void;
  musicDocked: boolean;
  dockedChapter: ChapterTrack | null;
  offer: (track: ChapterTrack) => void;
  play: (track: AudioTrack) => void;
  toggle: () => void;
  stop: () => void;
  dockMusic: () => void;
  dockChapter: () => void;
  offerMusicDock: () => void;
};

const BookAudioContext = createContext<BookAudioValue | null>(null);

export function useBookAudio() {
  const ctx = useContext(BookAudioContext);
  if (!ctx) {
    throw new Error("useBookAudio must be used within BookAudioProvider");
  }
  return ctx;
}

function sameTrack(a: AudioTrack | null, b: AudioTrack) {
  if (!a) return false;
  if (a.kind !== b.kind) return false;
  if (a.kind === "music") return true;
  return b.kind === "chapter" && a.slug === b.slug;
}

function trackSrc(track: AudioTrack): string {
  if (track.kind === "music") return track.src;
  return pickChapterAudio(track.slug, track.src);
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function applyTime(el: HTMLAudioElement, seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return;
  try {
    el.currentTime = seconds;
  } catch {
    /* readyState too low; metadata/play will retry from intended */
  }
}

export function BookAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const assignedSrc = useRef<string | null>(null);
  const pendingPlay = useRef(false);
  const intended = useRef(0);
  const holding = useRef(false);
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(CHAPTER_VOLUME);
  const [follow, setFollow] = useState(true);
  const [musicDocked, setMusicDocked] = useState(false);
  const [chapterResume, setChapterResume] = useState<ChapterResume | null>(null);
  const trackRef = useRef<AudioTrack | null>(null);
  const musicDockRef = useRef<HTMLButtonElement>(null);
  const chapterDockRef = useRef<HTMLButtonElement>(null);
  const focusMusicDock = useRef(false);
  const focusChapterDock = useRef(false);
  const hasPlayed = useRef(false);
  const playingRef = useRef(false);
  const endedRef = useRef(false);
  const restorePos = useRef<number | null>(null);
  const chapterResumeRef = useRef<ChapterResume | null>(null);
  trackRef.current = track;
  playingRef.current = playing;
  endedRef.current = ended;
  chapterResumeRef.current = chapterResume;

  const remember = useCallback(() => {
    const current = trackRef.current;
    if (current?.kind !== "chapter") return;
    const prev = readPlace();
    if (prev && prev.slug !== current.slug) return;
    writePlace({
      slug: current.slug,
      number: current.number,
      title: current.title,
      time: intended.current,
      ended: endedRef.current,
    });
  }, []);

  const lockSeek = useCallback((seconds: number) => {
    intended.current = seconds;
    holding.current = true;
    setEnded(false);
    setTime(seconds);
    const el = audioRef.current;
    if (el) applyTime(el, seconds);
  }, []);

  const resumeFromIntended = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    holding.current = true;
    applyTime(el, intended.current);
    setEnded(false);
    void el.play().then(() => {
      applyTime(el, intended.current);
    }).catch(() => {});
  }, []);

  const offer = useCallback((next: ChapterTrack) => {
    setTrack((prev) => {
      if (chapterResumeRef.current) return prev;
      if (!prev) return next;
      if (sameTrack(prev, next)) return prev;
      const el = audioRef.current;
      if (prev.kind === "chapter" && el && (!el.paused || intended.current > 0.4)) {
        return prev;
      }
      if (el && !el.paused) return prev;
      if (prev.kind === "music") setMusicDocked(true);
      return next;
    });
  }, []);

  const expandChapter = useCallback((snap: ChapterResume) => {
    const t = snap.ended ? 0 : snap.time;
    intended.current = t;
    holding.current = true;
    restorePos.current = t;
    setEnded(false);
    setTime(t);
    setChapterResume(null);
    chapterResumeRef.current = null;
    if (trackRef.current?.kind === "music") setMusicDocked(true);
    setVolume(CHAPTER_VOLUME);
    pendingPlay.current = snap.ended || snap.wasPlaying;
    const el = audioRef.current;
    if (el && assignedSrc.current === trackSrc(snap.track)) {
      el.volume = CHAPTER_VOLUME;
      el.loop = false;
      applyTime(el, t);
      setTrack(snap.track);
      if (pendingPlay.current) {
        pendingPlay.current = false;
        holding.current = true;
        void el.play().then(() => applyTime(el, intended.current)).catch(() => {});
      }
      return;
    }
    setTrack(snap.track);
  }, []);

  const play = useCallback((next: AudioTrack) => {
    const prev = trackRef.current;
    if (next.kind === "music") {
      setMusicDocked(false);
      if (prev?.kind === "chapter" && hasPlayed.current) {
        remember();
        const snap: ChapterResume = {
          track: prev,
          time: intended.current,
          ended: endedRef.current,
          wasPlaying: playingRef.current && !endedRef.current,
        };
        chapterResumeRef.current = snap;
        setChapterResume(snap);
      }
    } else {
      const snap = chapterResumeRef.current;
      if (snap && next.slug === snap.track.slug) {
        expandChapter(snap);
        return;
      }
      if (prev?.kind === "music") setMusicDocked(true);
      setChapterResume(null);
      chapterResumeRef.current = null;
      hasPlayed.current = false;
    }
    setVolume(next.kind === "music" ? MUSIC_VOLUME : CHAPTER_VOLUME);
    setEnded(false);
    const el = audioRef.current;
    if (el && assignedSrc.current === trackSrc(next)) {
      pendingPlay.current = false;
      el.volume = next.kind === "music" ? MUSIC_VOLUME : CHAPTER_VOLUME;
      el.loop = next.kind === "music";
      resumeFromIntended();
      setTrack((cur) => (sameTrack(cur, next) ? cur : next));
      return;
    }
    if (prev?.kind === "chapter" && !sameTrack(prev, next)) remember();
    pendingPlay.current = true;
    intended.current = 0;
    holding.current = false;
    setTrack((cur) => (sameTrack(cur, next) ? cur : next));
  }, [expandChapter, remember, resumeFromIntended]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      if (endedRef.current) {
        intended.current = 0;
        holding.current = true;
        setEnded(false);
        setTime(0);
        applyTime(el, 0);
      }
      resumeFromIntended();
    } else el.pause();
  }, [resumeFromIntended]);

  const dockMusic = useCallback(() => {
    const el = audioRef.current;
    if (el) el.pause();
    focusMusicDock.current = true;
    setMusicDocked(true);
    setPlaying(false);
    if (trackRef.current?.kind === "music") {
      setTrack(null);
    }
  }, []);

  const offerMusicDock = useCallback(() => {
    if (trackRef.current) return;
    setMusicDocked(true);
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    assignedSrc.current = null;
    pendingPlay.current = false;
    intended.current = 0;
    holding.current = false;
    hasPlayed.current = false;
    setTrack(null);
    setPlaying(false);
    setEnded(false);
    setTime(0);
    setDuration(0);
  }, []);

  const dockChapter = useCallback(() => {
    const current = trackRef.current;
    if (current?.kind !== "chapter") return;
    if (!hasPlayed.current) {
      stop();
      return;
    }
    remember();
    const snap: ChapterResume = {
      track: current,
      time: intended.current,
      ended: endedRef.current,
      wasPlaying: playingRef.current && !endedRef.current,
    };
    chapterResumeRef.current = snap;
    setChapterResume(snap);
    const el = audioRef.current;
    if (el) el.pause();
    focusChapterDock.current = true;
    setPlaying(false);
    setTrack(null);
  }, [remember, stop]);

  useLayoutEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    if (assignedSrc.current !== trackSrc(track)) {
      assignedSrc.current = trackSrc(track);
      const restore = restorePos.current;
      restorePos.current = null;
      if (restore == null && track.kind === "chapter") {
        const place = readPlace();
        if (place && place.slug === track.slug && !place.ended && place.time > 0.4) {
          intended.current = place.time;
          holding.current = true;
          setTime(place.time);
          setDuration(0);
          setEnded(false);
        } else {
          intended.current = 0;
          holding.current = false;
          setTime(0);
          setDuration(0);
          setEnded(false);
        }
      } else if (restore == null) {
        intended.current = 0;
        holding.current = false;
        setTime(0);
        setDuration(0);
        setEnded(false);
      } else {
        intended.current = restore;
        holding.current = true;
      }
      el.src = trackSrc(track);
      el.loop = track.kind === "music";
    }
    if (pendingPlay.current) {
      pendingPlay.current = false;
      resumeFromIntended();
    }
  }, [track, resumeFromIntended]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    setFollow(true);
  }, [track && track.kind === "chapter" ? track.slug : ""]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.querySelector("dialog[open]")) return;
        if (trackRef.current?.kind === "music") {
          e.preventDefault();
          dockMusic();
        } else if (trackRef.current?.kind === "chapter") {
          e.preventDefault();
          dockChapter();
        }
        return;
      }
      if (e.key !== " " && e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (!track || track.kind !== "chapter") return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [track, toggle, dockMusic, dockChapter]);

  useEffect(() => {
    const onHide = () => remember();
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [remember]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--player-h",
      track ? "3rem" : "0px",
    );
    const showMusicDock = musicDocked && track?.kind !== "music";
    document.documentElement.style.setProperty(
      "--dock-h",
      showMusicDock ? "3.5rem" : "0px",
    );
    return () => {
      document.documentElement.style.setProperty("--player-h", "0px");
      document.documentElement.style.setProperty("--dock-h", "0px");
    };
  }, [track, musicDocked]);

  useEffect(() => {
    if (!musicDocked || track?.kind === "music" || !focusMusicDock.current) return;
    focusMusicDock.current = false;
    musicDockRef.current?.focus();
  }, [musicDocked, track]);

  useEffect(() => {
    if (!chapterResume || track?.kind === "chapter" || !focusChapterDock.current) {
      return;
    }
    focusChapterDock.current = false;
    chapterDockRef.current?.focus();
  }, [chapterResume, track]);

  const value = useMemo(
    () => ({
      track,
      playing,
      ended,
      time,
      follow,
      setFollow,
      musicDocked,
      dockedChapter: chapterResume?.track ?? null,
      offer,
      play,
      toggle,
      stop,
      dockMusic,
      dockChapter,
      offerMusicDock,
    }),
    [track, playing, ended, time, follow, musicDocked, chapterResume, offer, play, toggle, stop, dockMusic, dockChapter, offerMusicDock],
  );

  return (
    <BookAudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={(e) => {
          setPlaying(true);
          setEnded(false);
          if (trackRef.current?.kind === "chapter") hasPlayed.current = true;
          applyTime(e.currentTarget, intended.current);
        }}
        onPause={() => {
          setPlaying(false);
          if (hasPlayed.current) remember();
        }}
        onError={() => {
          const current = trackRef.current;
          const el = audioRef.current;
          if (!el || !current || current.kind !== "chapter") return;
          if (!isAacSrc(assignedSrc.current ?? "")) return;
          assignedSrc.current = current.src;
          el.src = current.src;
          el.loop = false;
          applyTime(el, intended.current);
          if (pendingPlay.current || playingRef.current) {
            pendingPlay.current = false;
            holding.current = true;
            void el.play().then(() => applyTime(el, intended.current)).catch(() => {});
          }
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          const t = el.currentTime;
          if (!Number.isFinite(t) || t < 0) return;
          if (holding.current) {
            if (Math.abs(t - intended.current) > 0.5) {
              applyTime(el, intended.current);
              return;
            }
            holding.current = false;
          }
          if (el.paused) return;
          intended.current = t;
          setTime(t);
        }}
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          const d = el.duration;
          setDuration(Number.isFinite(d) && d > 0 ? d : 0);
          applyTime(el, intended.current);
          setTime(intended.current);
        }}
        onSeeked={(e) => {
          const el = e.currentTarget;
          const t = el.currentTime;
          if (!Number.isFinite(t) || t < 0) return;
          if (holding.current) {
            if (Math.abs(t - intended.current) > 0.5) {
              applyTime(el, intended.current);
              return;
            }
            holding.current = false;
          }
        }}
        onEnded={(e) => {
          if (track?.kind === "music") return;
          const d = e.currentTarget.duration;
          const at = Number.isFinite(d) && d > 0 ? d : intended.current;
          holding.current = false;
          intended.current = at;
          endedRef.current = true;
          setPlaying(false);
          setEnded(true);
          setTime(at);
          remember();
        }}
      />
      {children}
      <PlayerBar
        track={track}
        playing={playing}
        time={time}
        duration={duration}
        volume={volume}
        onSeek={lockSeek}
        onVolume={(value) => {
          setVolume(value);
          if (audioRef.current) audioRef.current.volume = value;
        }}
        onToggle={toggle}
        onDockMusic={dockMusic}
        onDockChapter={dockChapter}
        follow={follow}
        onFollow={setFollow}
      />
      {chapterResume && track?.kind !== "chapter" ? (
        <button
          ref={chapterDockRef}
          type="button"
          onClick={() => expandChapter(chapterResume)}
          aria-label={`Resume Chapter ${chapterResume.track.number} reading`}
          className="fixed left-4 bottom-4 z-[60] flex size-11 flex-col items-center justify-center border border-fog/35 bg-ink/90 text-brass backdrop-blur-md hover:border-brass hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass sm:left-6 sm:bottom-6"
        >
          <span className="font-sans text-[0.5rem] leading-none tracking-[0.14em] text-fog uppercase">
            Ch
          </span>
          <span className="mt-0.5 font-sans text-[0.8rem] leading-none tabular-nums">
            {chapterResume.track.number}
          </span>
        </button>
      ) : null}
      {musicDocked && track?.kind !== "music" ? (
        <button
          ref={musicDockRef}
          type="button"
          onClick={() => play(SKYWATCH)}
          aria-label="Play Skywatch Silence"
          className="fixed right-4 bottom-4 z-[60] flex h-11 items-center gap-2 border border-fog/35 bg-ink/90 px-3 text-brass backdrop-blur-md hover:border-brass hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass sm:right-6 sm:bottom-6"
        >
          <Music2 className="size-4" aria-hidden />
          <span className="font-sans text-[0.68rem] tracking-[0.16em] uppercase">
            Music
          </span>
        </button>
      ) : null}
    </BookAudioContext.Provider>
  );
}

function PlayerBar({
  track,
  playing,
  time,
  duration,
  volume,
  onSeek,
  onVolume,
  onToggle,
  onDockMusic,
  onDockChapter,
  follow,
  onFollow,
}: {
  track: AudioTrack | null;
  playing: boolean;
  time: number;
  duration: number;
  volume: number;
  onSeek: (value: number) => void;
  onVolume: (value: number) => void;
  onToggle: () => void;
  onDockMusic: () => void;
  onDockChapter: () => void;
  follow: boolean;
  onFollow: (value: boolean) => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!track) return null;

  const music = track.kind === "music";
  const label = music
    ? playing
      ? "Pause Skywatch Silence"
      : "Play Skywatch Silence"
    : playing
      ? "Pause reading"
      : `Play Chapter ${track.number}, ${track.title}`;
  const elapsed =
    Number.isFinite(time) && time >= 0
      ? duration > 0
        ? Math.min(time, duration)
        : time
      : 0;
  const titleClass =
    "min-w-0 shrink truncate font-sans text-[0.68rem] tracking-[0.14em] text-fog uppercase";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-16 z-50"
      role="region"
      aria-label={music ? "Music" : "Synthetic chapter reading"}
    >
      <div className="pointer-events-auto border-b border-rule/80 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-3 sm:px-6">
          <button
            type="button"
            onClick={onToggle}
            className="flex size-11 shrink-0 items-center justify-center text-brass hover:text-paper"
            aria-label={label}
            aria-keyshortcuts="Space"
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </button>
          {!music ? (
            <span className="hidden shrink-0 font-sans text-[0.58rem] tracking-[0.16em] text-muted uppercase lg:inline">
              Space
            </span>
          ) : null}
          {music ? (
            pathname === "/" ? (
              <p className={titleClass}>{track.title}</p>
            ) : (
              <Link to="/" className={`${titleClass} hover:text-paper`}>
                {track.title}
              </Link>
            )
          ) : (
            <>
              <Link
                to="/chapters/$slug"
                params={{ slug: track.slug }}
                className={`${titleClass} hover:text-paper`}
              >
                Chapter {String(track.number).padStart(2, "0")} · {track.title}
              </Link>
              <Link
                to="/sources"
                hash="reading"
                className="shrink-0 font-sans text-[0.58rem] tracking-[0.16em] text-muted uppercase hover:text-paper"
              >
                Synthetic
              </Link>
            </>
          )}
          {music ? (
            <label className="flex min-w-20 flex-1 sm:max-w-40">
              <span className="sr-only">Volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => onVolume(Number(e.target.value))}
                className="h-1 w-full cursor-pointer accent-brass"
              />
            </label>
          ) : duration > 0 ? (
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={elapsed}
              onInput={(e) => onSeek(Number(e.currentTarget.value))}
              onChange={(e) => onSeek(Number(e.currentTarget.value))}
              aria-label="Reading position"
              className="hidden h-1 min-w-0 flex-1 cursor-pointer accent-brass sm:block"
            />
          ) : (
            <span className="hidden flex-1 sm:block" />
          )}
          <p className="shrink-0 font-sans text-[0.68rem] tabular-nums tracking-wide text-muted">
            {formatTime(elapsed)}
            {duration ? ` / ${formatTime(duration)}` : ""}
          </p>
          {!music && (sentenceCues[track.slug] || chapterCues[track.slug]) ? (
            <button
              type="button"
              onClick={() => onFollow(!follow)}
              aria-pressed={follow}
              className={`inline-flex min-h-11 shrink-0 items-center px-1.5 font-sans text-[0.62rem] tracking-[0.14em] uppercase sm:px-2 sm:tracking-[0.16em] ${
                follow ? "text-brass" : "text-muted hover:text-paper"
              }`}
            >
              {follow ? "Following" : "Follow"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={music ? onDockMusic : onDockChapter}
            className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-paper"
            aria-label={music ? "Hide Skywatch Silence" : "Hide reading"}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
