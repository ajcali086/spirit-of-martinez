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
import { Link } from "@tanstack/react-router";
import { Pause, Play, X } from "lucide-react";

export type AudioTrack = {
  src: string;
  title: string;
  number: number;
  slug: string;
};

type BookAudioValue = {
  track: AudioTrack | null;
  playing: boolean;
  offer: (track: AudioTrack) => void;
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

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BookAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const offer = useCallback((next: AudioTrack) => {
    setTrack((prev) => {
      if (prev && prev.slug !== next.slug && audioRef.current && !audioRef.current.paused) {
        return prev;
      }
      return prev?.slug === next.slug ? prev : next;
    });
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
    setTrack(null);
    setPlaying(false);
    setTime(0);
    setDuration(0);
  }, []);

  useLayoutEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    if (el.getAttribute("src") !== track.src) {
      el.src = track.src;
      el.load();
    }
  }, [track]);

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
    () => ({ track, playing, offer, toggle, stop }),
    [track, playing, offer, toggle, stop],
  );

  return (
    <BookAudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
      />
      {children}
      <PlayerBar
        track={track}
        playing={playing}
        time={time}
        duration={duration}
        onSeek={(value) => {
          const el = audioRef.current;
          if (!el) return;
          el.currentTime = value;
          setTime(value);
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
  onSeek,
  onToggle,
  onStop,
}: {
  track: AudioTrack | null;
  playing: boolean;
  time: number;
  duration: number;
  onSeek: (value: number) => void;
  onToggle: () => void;
  onStop: () => void;
}) {
  if (!track) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-16 z-50"
      role="region"
      aria-label="Chapter reading"
    >
      <div className="pointer-events-auto border-b border-rule/80 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-3 sm:px-6">
          <button
            type="button"
            onClick={onToggle}
            className="flex size-11 shrink-0 items-center justify-center text-brass hover:text-paper"
            aria-label={playing ? "Pause reading" : `Play Chapter ${track.number}, ${track.title}`}
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </button>
          <Link
            to="/chapters/$slug"
            params={{ slug: track.slug }}
            className="min-w-0 shrink truncate font-sans text-[0.68rem] tracking-[0.14em] text-fog uppercase hover:text-paper"
          >
            Chapter {String(track.number).padStart(2, "0")} · {track.title}
          </Link>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Number.isFinite(time) ? time : 0}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Reading position"
            className="hidden h-1 min-w-0 flex-1 cursor-pointer accent-brass sm:block"
          />
          <p className="shrink-0 font-sans text-[0.68rem] tabular-nums tracking-wide text-muted">
            {formatTime(time)}
            {duration ? ` / ${formatTime(duration)}` : ""}
          </p>
          <button
            type="button"
            onClick={onStop}
            className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-paper"
            aria-label="Close reading"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
