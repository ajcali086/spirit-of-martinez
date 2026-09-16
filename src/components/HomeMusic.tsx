import { useEffect, useRef } from "react";
import { useBookAudio } from "@/components/layout/BookAudio";

export function HomeMusic() {
  const { track, musicDocked, offerMusicDock } = useBookAudio();
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    if (track || musicDocked) return;
    offerMusicDock();
  }, [track, musicDocked, offerMusicDock]);

  return null;
}