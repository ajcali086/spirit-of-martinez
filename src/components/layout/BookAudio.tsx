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
import { Pause, Play, X } from "lucide-react";
import { chapterCues } from "@/data/cues";
import { sentenceCues } from "@/data/sentenceCues";

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

type BookAudioValue = {
  track: AudioTrack | null;
  playing: boolean;
  ended: boolean;
  time: number;
  follow: boolean;
  setFollow: (value: boolean) => void;
  offer: (track: ChapterTrack) => void;
  play: (track: AudioTrack) => void;
  toggle: () => void;
  stop: () => void;
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
      if (!prev) return next;
      if (sameTrack(prev, next)) return prev;
      const el = audioRef.current;
      if (prev.kind === "chapter" && el && (!el.paused || intended.current > 0.4)) {
        return prev;
      }
      if (el && !el.paused) return prev;
      return next;
    });
  }, []);

  const play = useCallback((next: AudioTrack) => {
    setVolume(next.kind === "music" ? MUSIC_VOLUME : CHAPTER_VOLUME);
    setEnded(false);
    const el = audioRef.current;
    if (el && assignedSrc.current === next.src) {
      pendingPlay.current = false;
      el.volume = next.kind === "music" ? MUSIC_VOLUME : CHAPTER_VOLUME;
      el.loop = next.kind === "music";
      resumeFromIntended();
      return;
    }
    pendingPlay.current = true;
    intended.current = 0;
    holding.current = false;
    setTrack((prev) => (sameTrack(prev, next) ? prev : next));
  }, [resumeFromIntended]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) resumeFromIntended();
    else el.pause();
  }, [resumeFromIntended]);

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
    setTrack(null);
    setPlaying(false);
    setEnded(false);
    setTime(0);
    setDuration(0);
  }, []);

  useLayoutEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    if (assignedSrc.current !== track.src) {
      assignedSrc.current = track.src;
      intended.current = 0;
      holding.current = false;
      el.src = track.src;
      el.loop = track.kind === "music";
      setTime(0);
      setDuration(0);
      setEnded(false);
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
      if (e.key !== " " && e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (!track || track.kind !== "chapter") return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [track, toggle]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--player-h",
      track ? "3rem" : "0px",
    );
    return () => {
      document.documentElement.style.setProperty("--player-h", "0px");
    };
  }, [track]);

  const value = useMemo(
    () => ({
      track,
      playing,
      ended,
      time,
      follow,
      setFollow,
      offer,
      play,
      toggle,
      stop,
    }),
    [track, playing, ended, time, follow, offer, play, toggle, stop],
  );

  return (
    <BookAudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={(e) => {
          setPlaying(true);
          setEnded(false);
          applyTime(e.currentTarget, intended.current);
        }}
        onPause={() => setPlaying(false)}
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
          setPlaying(false);
          setEnded(true);
          setTime(at);
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
        onStop={stop}
        follow={follow}
        onFollow={setFollow}
      />
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
  onStop,
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
  onStop: () => void;
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
      aria-label={music ? "Music" : "Chapter reading"}
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
            <Link
              to="/chapters/$slug"
              params={{ slug: track.slug }}
              className={`${titleClass} hover:text-paper`}
            >
              Chapter {String(track.number).padStart(2, "0")} · {track.title}
            </Link>
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
            onClick={onStop}
            className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-paper"
            aria-label={music ? "Stop music" : "Close reading"}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
