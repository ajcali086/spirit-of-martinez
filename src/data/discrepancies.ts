import type { PhotoId } from "./types";

/**
 * Every place the book leaves two records in disagreement.
 *
 * An entry qualifies only where the book's own text leaves the conflict
 * standing — "both stand", "left in disagreement", "not reconciled here",
 * "left open", "neither is resolved". A conflict the book explains is not a
 * conflict left standing, and does not belong here.
 *
 * Nothing in this file is new prose except `title`. The claims are
 * transcribed from the cited passage; `close` is the book's own line,
 * verbatim, with a leading ellipsis where the source reads as a clause
 * inside a longer sentence rather than a sentence of its own.
 *
 * The register points at the book. It never edits it, and it never settles
 * anything the book left open.
 */
export type Discrepancy = {
  /** Stable slug; also the entry's DOM id for deep links. */
  id: string;
  /** Short in-register title. The only authored string per entry. */
  title: string;
  /** The two records' claims, one line each, transcribed from the passage. */
  claims?: [string, string];
  /** For an ambiguity rather than two competing records. One of claims / note is required. */
  note?: string;
  /** The book's own closing line, verbatim. */
  close: string;
  /** Deep link to the passage. The anchor must exist in chapterAnchorIds. */
  paragraph?: { slug: string; anchor: string };
  /** Deep link to the plate. Must exist in photos. */
  plate?: PhotoId;
  /** Deep link to the map pin (/missions#map-N), 1–31. */
  mission?: number;
};

export const discrepancies: Discrepancy[] = [
  {
    id: "chart-date",
    title: "The 23rd or the 24th",
    claims: [
      "The surviving captains’ chart is hand-dated 23 Feb. 1945 and numbered Mission #7.",
      "The crew record puts mission seven on the 24th, at Bremen.",
    ],
    close: "Both stand.",
    plate: "chart7",
    mission: 7,
  },
  {
    id: "m17-target",
    title: "Ahlhorn or the south",
    claims: [
      "The crew record puts mission seventeen at the Luftwaffe airfield at Ahlhorn.",
      "The family’s clipping kept against that page names Ingolstadt, Fürth and Grafenwöhr, not Ahlhorn.",
    ],
    close: "They are left in disagreement.",
    paragraph: { slug: "borrowed-aircraft", anchor: "m-17" },
    mission: 17,
  },
  {
    id: "jacket-count",
    title: "Thirty symbols, twenty-nine mornings",
    claims: [
      "Thirty bomb symbols are painted on the B-15 flight jacket in the collection.",
      "The 95th Bomb Group’s own crew record puts the number flown specifically in the Spirit of Martinez at twenty-nine.",
    ],
    close: "The jacket and the database disagree by exactly one symbol.",
    paragraph: { slug: "borrowed-aircraft", anchor: "11.3a-p11" },
    plate: "jacket",
  },
  {
    id: "nose-art",
    title: "Plaque or paint",
    claims: [
      "The naming committee, the article reports, was disappointed to learn the name consisted merely of a small plaque mounted under the instrument panel.",
      "The surviving photograph of Frank beside the aircraft shows the name painted across the nose in script a good deal larger than a plaque.",
    ],
    close: "…the two accounts are not reconciled here.",
    paragraph: { slug: "borrowed-aircraft", anchor: "11.3-p4" },
    plate: "nameonplane",
  },
  {
    id: "markus-role",
    title: "Togglier or bombardier",
    claims: [
      "The Bartlesville Examiner-Enterprise obituary makes him master bombardier, relief navigator and co-pilot, and sends the food drops over Holland and France.",
      "The crew record puts him in the nose as togglier. Chowhound was the Netherlands.",
    ],
    close: "The disagreement is left standing.",
    // The note block carries no paragraph id; the section is the anchor.
    paragraph: { slug: "what-came-back", anchor: "13.5" },
  },
  {
    id: "bill-service",
    title: "Navy air corps or antiaircraft",
    claims: [
      "The 1946 Gazette article describes Bill as having served in the Navy air corps’ ground forces.",
      "An April 1944 Gazette item places Bill at Nashville in the Army’s antiaircraft artillery, and his mother’s obituary that July calls him Corporal, a rank the Navy does not use.",
    ],
    close: "The later paper is reproduced here as it stands, and the conflict is left open.",
    paragraph: { slug: "what-came-back", anchor: "13.2-p2" },
  },
  {
    id: "birth-years",
    title: "1884 or 1888; 1925 or 1926",
    claims: [
      "The genealogical registry gives Angelina’s birth year as 1884 and Virginia’s as 1925.",
      "This book has used approximately 1888 for Angelina, from a 1928 Gazette article putting her age at forty at her sixteenth child’s birth, and 1926 for Virginia.",
    ],
    close:
      "Neither conflict is large enough to argue past a single source in either direction, and neither is resolved here.",
    paragraph: { slug: "what-came-back", anchor: "13.2-p5" },
  },
  {
    id: "sam-death",
    title: "1946 or 1947",
    claims: [
      "Cemetery records, contemporary Gazette coverage, and a genealogical registry put Sam’s death at March 2, 1946.",
      "The July 1955 Gazette article states Frank and Bill took over the shop from their brother Sam “following his death in 1947.”",
    ],
    close: "…the conflict is noted rather than resolved.",
    paragraph: { slug: "what-came-back", anchor: "13.3-p2" },
  },
  {
    id: "rodia-year",
    title: "1875 or 1879",
    claims: [
      "Nick Calicura is quoted giving his uncle’s birth year as 1875, in the province of Avellino — a year the article itself calls disputed.",
      "The public sources already cited in the chapter give 1879.",
    ],
    close:
      "Consistent with how this book treats every other such conflict, neither figure is adopted over the other.",
    paragraph: { slug: "uncle-sam", anchor: "15.3-p2" },
    plate: "rodia",
  },
  {
    id: "va-cause",
    title: "Which of the two",
    note: "Which of the two the examiner meant cannot be known, because the surviving letter does not say…",
    close: "…the ambiguity is better left unresolved than settled by preference.",
    paragraph: { slug: "the-number", anchor: "14.3-p3" },
  },
  {
    id: "the-count",
    title: "Twenty-eight and thirty-one",
    claims: [
      "Stuart’s own memorandum, dated May 8, 1945, certifies twenty-eight operational missions.",
      "The three Chowhound drops over Utrecht in May carry no number at all.",
    ],
    close: "…twenty-eight and thirty-one are both true statements about the same spring.",
    paragraph: { slug: "the-number", anchor: "14.2-p7" },
  },
];
