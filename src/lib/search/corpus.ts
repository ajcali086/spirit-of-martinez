import { chapters } from "../../data/chapters.ts";
import { crew } from "../../data/crew.ts";
import { missions } from "../../data/missions.ts";
import { photoList, photos } from "../../data/photos.ts";
import {
  closing,
  methodRules,
  provenance,
  readingNote,
  sourceAnchor,
  sourceBlockId,
  sourceClasses,
} from "../../data/sources.ts";
import { timeline } from "../../data/timeline.ts";
import type { Block } from "../../data/types.ts";
import type { SearchRecord } from "./types.ts";

function chapterNo(n: number) {
  return String(n).padStart(2, "0");
}

function pushBlock(
  records: SearchRecord[],
  order: { n: number },
  block: Block,
  index: number,
  prefix: string,
  title: string,
  type: string,
) {
  if (block.type !== "p" && block.type !== "note") return;
  records.push({
    group: "sources",
    order: order.n++,
    type,
    title,
    titleText: title,
    body: block.text,
    href: `/sources#${sourceBlockId(prefix, index)}`,
  });
}

/** One record per paragraph, plate, person, mission, timeline entry, and source block. */
export function buildSearchIndex(): SearchRecord[] {
  const records: SearchRecord[] = [];
  let order = 0;

  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      let pIndex = 0;
      for (const block of section.blocks) {
        if (block.type !== "p") continue;
        const id = block.id ?? `${section.id}-p${pIndex}`;
        pIndex += 1;
        records.push({
          group: "chapters",
          order: order++,
          type: `Chapter ${chapterNo(chapter.number)}`,
          title: section.title,
          titleText: `${chapter.title} ${section.title}`,
          body: block.text,
          href: `/chapters/${chapter.slug}#${id}`,
          chip: section.id,
        });
      }
    }
  }

  for (const mission of missions) {
    const kind = mission.kind === "humanitarian" ? "Food drop" : `Mission ${chapterNo(mission.number)}`;
    records.push({
      group: "missions",
      order: order++,
      type: kind,
      title: mission.target,
      titleText: `${mission.target} ${mission.dateLabel}`,
      body: `${mission.notes} ${mission.aircraft}${mission.clipping ? ` ${mission.clipping}` : ""}`,
      href: `/missions#m-${mission.number}`,
      chip: `m-${mission.number}`,
    });
  }

  const plates = [...photoList];
  for (const photo of Object.values(photos)) {
    if (!plates.some((p) => p.id === photo.id)) plates.push(photo);
  }
  for (const photo of plates) {
    records.push({
      group: "plates",
      order: order++,
      type: photo.kind === "object" ? "Object" : "Photograph",
      title: photo.title,
      titleText: `${photo.title} ${photo.caption}`,
      body: `${photo.caption} ${photo.alt}`,
      href: `/archive/${photo.id}`,
      chip: photo.date,
    });
  }

  for (const member of crew) {
    records.push({
      group: "crew",
      order: order++,
      type: member.role,
      title: member.name,
      titleText: `${member.name} ${member.role} ${member.hometown}`,
      body: `${member.wartime} ${member.after}`,
      href: `/crew/${member.id}`,
    });
  }

  for (const event of timeline) {
    records.push({
      group: "timeline",
      order: order++,
      type: event.date,
      title: event.title,
      titleText: `${event.title} ${event.date}`,
      body: event.body,
      href: `/timeline#${event.id}`,
    });
  }

  const sourceOrder = { n: order };
  provenance.forEach((block, i) =>
    pushBlock(records, sourceOrder, block, i, "provenance", "Provenance", "Sources"),
  );
  records.push({
    group: "sources",
    order: sourceOrder.n++,
    type: "Sources",
    title: "The reading",
    titleText: "The reading",
    body: readingNote,
    href: "/sources#reading",
  });
  for (const source of sourceClasses) {
    const prefix = sourceAnchor(source.name);
    source.blocks.forEach((block, i) =>
      pushBlock(records, sourceOrder, block, i, prefix, source.name, source.ordinal),
    );
  }
  methodRules.forEach((rule) => {
    records.push({
      group: "sources",
      order: sourceOrder.n++,
      type: "Sources",
      title: rule.rule,
      titleText: rule.rule,
      body: rule.body,
      href: `/sources#${sourceAnchor(rule.rule)}`,
    });
  });
  closing.forEach((block, i) =>
    pushBlock(records, sourceOrder, block, i, "sources-close", "A note on sources", "Sources"),
  );

  return records;
}
