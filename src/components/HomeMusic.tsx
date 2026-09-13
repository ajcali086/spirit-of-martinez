import { useEffect, useRef } from "react";
import { SKYWATCH, useBookAudio } from "@/components/layout/BookAudio";

export function HomeMusic() {
  const { track, play } = useBookAudio();
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    if (track) return;
    play(SKYWATCH);
  }, [track, play]);

  return null;
}
