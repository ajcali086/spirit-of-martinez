import { chapters } from "./chapters";
import { chapterCues, collapseToParagraphs, type ReadingCue } from "./cues";
import type { Chapter, Section } from "./types";

import borrowedAircraft from "@/generated/moments/cues/borrowed-aircraft.json";
import eightEmptyPlaces from "@/generated/moments/cues/eight-empty-places.json";
import missionOne from "@/generated/moments/cues/mission-one.json";
import nineHundredMilesSouth from "@/generated/moments/cues/nine-hundred-miles-south.json";
import nineStrangers from "@/generated/moments/cues/nine-strangers.json";
import ninetyFourHours from "@/generated/moments/cues/ninety-four-hours.json";
import station119 from "@/generated/moments/cues/station-119.json";
import theLockedDoor from "@/generated/moments/cues/the-locked-door.json";
import theNumber from "@/generated/moments/cues/the-number.json";
import theSpecialist from "@/generated/moments/cues/the-specialist.json";
import theStripByTheTracks from "@/generated/moments/cues/the-strip-by-the-tracks.json";
import uncleSam from "@/generated/moments/cues/uncle-sam.json";
import utrecht from "@/generated/moments/cues/utrecht.json";
import weightOfSmallMachines from "@/generated/moments/cues/weight-of-small-machines.json";
import whatCameBack from "@/generated/moments/cues/what-came-back.json";

type MomentsFile = {
  audio: string;
  silent: string[];
  weak: string[];
  cues: ReadingCue[];
};

/** Sync cue tables for section seeks / tests (lazy load lives in chapterMoments). */
const momentCuesBySlug: Record<string, ReadingCue[]> = {
  "borrowed-aircraft": (borrowedAircraft as MomentsFile).cues,
  "eight-empty-places": (eightEmptyPlaces as MomentsFile).cues,
  "mission-one": (missionOne as MomentsFile).cues,
  "nine-hundred-miles-south": (nineHundredMilesSouth as MomentsFile).cues,
  "nine-strangers": (nineStrangers as MomentsFile).cues,
  "ninety-four-hours": (ninetyFourHours as MomentsFile).cues,
  "station-119": (station119 as MomentsFile).cues,
  "the-locked-door": (theLockedDoor as MomentsFile).cues,
  "the-number": (theNumber as MomentsFile).cues,
  "the-specialist": (theSpecialist as MomentsFile).cues,
  "the-strip-by-the-tracks": (theStripByTheTracks as MomentsFile).cues,
  "uncle-sam": (uncleSam as MomentsFile).cues,
  utrecht: (utrecht as MomentsFile).cues,
  "weight-of-small-machines": (weightOfSmallMachines as MomentsFile).cues,
  "what-came-back": (whatCameBack as MomentsFile).cues,
};

export type SectionSeek = {
  id: string;
  title: string;
  start: number;
};

/** Same paragraph windows FOLLOW uses. */
export function paragraphCuesFor(slug: string) {
  const aligned = momentCuesBySlug[slug];
  if (aligned) return collapseToParagraphs(aligned);
  return chapterCues[slug];
}

/** Cue id of a section's first paragraph — matches the chapter renderer. */
export function firstParagraphCueId(section: Section) {
  let pIndex = 0;
  for (const b of section.blocks) {
    if (b.type !== "p") continue;
    const positional = `${section.id}-p${pIndex}`;
    return b.id?.startsWith("m-") ? positional : (b.id ?? positional);
  }
  return undefined;
}

function startForSection(
  section: Section,
  byId: Map<string, { id: string; start: number }>,
) {
  const title = byId.get(`sec-${section.id}-title`);
  if (title) return title.start;
  const kicker = byId.get(`sec-${section.id}-id`);
  if (kicker) return kicker.start;
  const pid = firstParagraphCueId(section);
  if (!pid) return undefined;
  return byId.get(pid)?.start;
}

export function sectionSeeksFor(chapter: Chapter): SectionSeek[] {
  if (!chapter.audio) return [];
  const cues = paragraphCuesFor(chapter.slug);
  if (!cues?.length) return [];
  const byId = new Map(cues.map((c) => [c.id, c]));
  const out: SectionSeek[] = [];
  for (const section of chapter.sections) {
    if (!section.title) continue;
    const start = startForSection(section, byId);
    if (start == null) continue;
    out.push({ id: section.id, title: section.title, start });
  }
  return out;
}

export const sectionSeeks: Record<string, SectionSeek[]> = Object.fromEntries(
  chapters.map((ch) => [ch.slug, sectionSeeksFor(ch)]),
);
