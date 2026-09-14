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

export function BookAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const assignedSrc = useRef<string | null>(null);
  const pendingPlay = useRef(false);
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(CHAPTER_VOLUME);

  const offer = useCallback((next: ChapterTrack) => {
    setTrack((prev) => {
      if (prev && audioRef.current && !audioRef.current.paused) return prev;
      return sameTrack(prev, next) ? prev : next;
    });
  }, []);

  const play = useCallback((next: AudioTrack) => {
    setVolume(next.kind === "music" ? MUSIC_VOLUME : CHAPTER_VOLUME);
    pendingPlay.current = true;
    setTrack((prev) => (sameTrack(prev, next) ? prev : next));
    const el = audioRef.current;
    if (el && assignedSrc.current === next.src) {
      pendingPlay.current = false;
      el.volume = next.kind === "music" ? MUSIC_VOLUME : CHAPTER_VOLUME;
      el.loop = next.kind === "music";
      void el.play().catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
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
    setTrack(null);
    setPlaying(false);
    setTime(0);
    setDuration(0);
  }, []);

  useLayoutEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    if (assignedSrc.current !== track.src) {
      assignedSrc.current = track.src;
      el.src = track.src;
      el.loop = track.kind === "music";
      setTime(0);
      setDuration(0);
      el.load();
    }
    if (pendingPlay.current) {
      pendingPlay.current = false;
      void el.play().catch(() => {
        /* Autoplay blocked. The bar play button is the way in. */
      });
    }
  }, [track]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

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
    () => ({ track, playing, offer, play, toggle, stop }),
    [track, playing, offer, play, toggle, stop],
  );

  return (
    <BookAudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (Number.isFinite(t) && t >= 0) setTime(t);
        }}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          setDuration(Number.isFinite(d) && d > 0 ? d : 0);
          const t = e.currentTarget.currentTime;
          setTime(Number.isFinite(t) && t >= 0 ? t : 0);
        }}
        onEnded={() => {
          if (track?.kind === "music") return;
          setPlaying(false);
        }}
      />
      {children}
      <PlayerBar
        track={track}
        playing={playing}
        time={time}
        duration={duration}
        volume={volume}
        onSeek={(value) => {
          const el = audioRef.current;
          if (!el || !Number.isFinite(value)) return;
          el.currentTime = value;
          setTime(value);
        }}
        onVolume={(value) => {
          setVolume(value);
          if (audioRef.current) audioRef.current.volume = value;
        }}
        onToggle={toggle}
        onStop={stop}
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
  const elapsed = duration > 0 && time > duration + 0.25 ? 0 : time;
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
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </button>
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
              onChange={(e) => onSeek(Number(e.target.value))}
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
