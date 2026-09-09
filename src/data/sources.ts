import type { Block } from "./types";

export type SourceClass = {
  ordinal: string;
  name: string;
  blocks: Block[];
};

export type MethodRule = {
  rule: string;
  body: string;
};

/**
 * The provenance disclosure. This is the first thing on the page and it is not
 * optional — every claim on this site rests on a collection assembled by a
 * descendant, and the reader is told that before they are told anything else.
 */
export const provenance: Block[] = [
  {
    type: "p",
    text: "This account was assembled from four kinds of material, and the difference between them matters more than any individual fact drawn from any of them.",
  },
  {
    type: "note",
    text: "It was assembled by a descendant. Frank Calicura was this writer’s grandfather, Joyce Calicura his grandmother, and Samuel Calicura — cited as a family witness, and the boy standing beside his father in the photograph that closes the book — is this writer’s father. The relationship is stated here because the same standard is applied to every other source in these pages: the reader is told who supplied a piece of evidence, and how close to it they stood.",
  },
];

export const sourceClasses: SourceClass[] = [
  {
    ordinal: "First",
    name: "The family collection",
    blocks: [
      {
        type: "p",
        text: "Military records, certificates, photographs, correspondence, newspaper clippings, and physical artifacts held by the descendants of Saverio and Angelina Calicura of Martinez, California.",
      },
      {
        type: "p",
        text: "It is not catalogued, not complete, and not neutral. It preserves what a family chose to keep, which is a different thing from what happened.",
      },
    ],
  },
  {
    ordinal: "Second",
    name: "The institutional record",
    blocks: [
      {
        type: "p",
        text: "Unit histories, crew records, mission logs, government correspondence, and the surviving federal paperwork of a man’s service. This material is more systematic and no more complete.",
      },
      {
        type: "note",
        text: "A great deal of it burned in St. Louis in 1973.",
      },
      {
        type: "p",
        text: "The 95th Bomb Group’s compiled crew record for this crew is published at 95thbgdb.com/crew/59. It is a modern database, not a paper issued at Horham. Each sortie on the mission board links to that compilation’s corresponding mission page.",
      },
    ],
  },
  {
    ordinal: "Third",
    name: "The contemporary press",
    blocks: [
      {
        type: "p",
        text: "Wire reports and hometown papers, several of them clipped and annotated by hand at the time. A substantial share of the mission clippings cited here comes from a single object: the scrapbook Joyce Calicura kept through the war and for the rest of her life.",
      },
      {
        type: "p",
        text: "She clipped the dispatches as they appeared. After Frank came home the two of them sequenced and numbered them together, glued to black pages and bound in a wooden cover made for the purpose.",
      },
      {
        type: "p",
        text: "The war coverage reproduced here is not a neutral sample of what the papers printed. It is what one woman in Martinez chose to cut out and keep while her husband was flying, arranged afterward in the order the missions were flown. Newspaper content is referenced by headline, publication, and date, paraphrased rather than reproduced, and treated throughout as what it is: a first draft written under deadline by people who did not have access to the records now available.",
      },
    ],
  },
  {
    ordinal: "Fourth",
    name: "The mission charts",
    blocks: [
      {
        type: "p",
        text: "Fourteen printed aeronautical charts, Newcastle to Prague, heights in feet, each headed CAPTAINS OF AIRCRAFT MAP and each annotated by hand with a mission number, a date, control points and their times, an initial point, a rally point, and flak concentrations shaded in colored pencil. They cover missions one through fourteen without a gap.",
      },
      {
        type: "note",
        text: "Whose hand made the annotations is not established here.",
      },
      {
        type: "p",
        text: "What the charts record is a mission count kept while the tour was still being flown. Where that count can be checked against the group’s crew record — at missions three, four, five, six, eight, nine, ten, twelve, thirteen and fourteen — the two agree.",
      },
      {
        type: "note",
        text: "The flak shading is planned intelligence, not observation. The times are briefed times, not flown times.",
      },
      { type: "figure", id: "chart7" },
    ],
  },
];

export const methodRules: MethodRule[] = [
  {
    rule: "Disagreements are stated, not resolved",
    body: "Where the three records conflict, the conflict is named on the page. Nothing is quietly reconciled to make a cleaner story.",
  },
  {
    rule: "Inferences are labelled where they are made",
    body: "Where a claim rests on inference rather than a document, it is identified as an inference in the text itself rather than buried in a note at the back.",
  },
  {
    rule: "Absence is reported",
    body: "Gaps in the record are stated as gaps. Nothing has been supplied to fill them.",
  },
  {
    rule: "The clipping is not the event",
    body: "A newspaper is evidence of what a paper printed, on deadline, at a distance. It is not evidence of what happened.",
  },
];

/**
 * Renders as a plain, quiet closing block. Deliberately unornamented.
 */
export const closing: Block[] = [
  {
    type: "p",
    text: "None of these documents agrees with all the others about exactly what happened, or exactly how many times it happened. The book stopped trying to resolve that. A family kept everything anyway.",
  },
];
