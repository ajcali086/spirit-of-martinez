import type { Mission } from "./types";

export const BGDB_CREW_URL = "https://95thbgdb.com/crew/59";

export function bgdbMissionUrl(id: number) {
  return `https://95thbgdb.com/mission/${id}`;
}

export function eighthMissionUrl(slug: string) {
  return `https://americanarchive.iwm.org.uk/archive/mission/${slug}`;
}

/** A captains' chart survives in the locker for missions one through fourteen, without a gap. */
export function hasCaptainsChart(m: Mission) {
  return m.kind === "combat" && m.number <= 14;
}

/** Horham, Station 119. Context for the map — not a drawn route origin. */
export const HORHAM = {
  lat: 52.30507,
  lng: 1.24259,
  label: "Horham · Station 119",
} as const;

/** Theater the map may show. Not a claimed operating area. */
export const THEATER = {
  sw: [40, -12] as [number, number],
  ne: [64, 28] as [number, number],
};

export type MissionsHash =
  | { view: "map"; number: number }
  | { view: "list"; number: number }
  | null;

/** Board hashes: `#m-6` is the list, `#map-6` is the pin. `#map` opens Mission 7. */
export function parseMissionsHash(hash: string): MissionsHash {
  const raw = String(hash).replace(/^#/, "");
  if (raw === "map") return { view: "map", number: 7 };
  const mapHit = /^map-(\d+)$/.exec(raw);
  if (mapHit) {
    const n = Number(mapHit[1]);
    if (n >= 1 && n <= 31) return { view: "map", number: n };
    return { view: "map", number: 7 };
  }
  const listHit = /^m-(\d+)$/.exec(raw);
  if (listHit) {
    const n = Number(listHit[1]);
    if (n >= 1 && n <= 31) return { view: "list", number: n };
  }
  return null;
}

export function placeKey(m: Pick<Mission, "lat" | "lng">) {
  return `${m.lat},${m.lng}`;
}

export type MissionPlace = {
  key: string;
  lat: number;
  lng: number;
  target: string;
  missions: Mission[];
};

/** One pin per place. Repeated targets share a marker. */
export function missionPlaces(list: Mission[]): MissionPlace[] {
  const groups = new Map<string, Mission[]>();
  for (const m of list) {
    const k = placeKey(m);
    const g = groups.get(k);
    if (g) g.push(m);
    else groups.set(k, [m]);
  }
  return [...groups.entries()].map(([key, ms]) => ({
    key,
    lat: ms[0].lat,
    lng: ms[0].lng,
    target: ms[0].target,
    missions: ms,
  }));
}

/** The chapter that already tells this morning, and the heading it opens on. */
export function missionChapter(m: Mission): { slug: string; label: string; hash: string } {
  if (m.kind === "humanitarian") {
    return { slug: "utrecht", label: "Utrecht", hash: "12.4" };
  }
  if (m.number === 1) {
    return { slug: "mission-one", label: "Mission One", hash: "m-1" };
  }
  if (m.number === 2) {
    return { slug: "mission-one", label: "Mission two", hash: "m-2" };
  }
  if (m.number === 12 || m.number >= 16) {
    return { slug: "borrowed-aircraft", label: "Borrowed Aircraft", hash: `m-${m.number}` };
  }
  return { slug: "ninety-four-hours", label: "Ninety-Four Hours", hash: `m-${m.number}` };
}

/** Men named in the note who have a page of their own. Austin, Greear, Bradley, Crawford do not. */
export function missionPeople(m: Mission): { id: string; name: string }[] {
  if (m.number === 1 || m.number === 12) {
    return [{ id: "probst", name: "Victor G. Probst" }];
  }
  return [];
}

export const missions: Mission[] = [
  {
    number: 1,
    record: 274,
    eighth: 830,
    eighthSlug: "8af-830",
    date: "1945-02-14",
    dateLabel: "14 February 1945",
    target: "Chemnitz",
    lat: 50.83669,
    lng: 12.92087,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "First combat mission. Marshalling yard in Saxony. Copilot for the day was Richard J. Austin, on loan from John Bradley’s crew. Victor Probst flew the same morning in The Red Fox. One of 457 B-17s sent to Chemnitz while a separate force hit Dresden, forty miles away.",
    clipping: "Key Rail City Near Capital Is Pounded",
  },
  {
    number: 2,
    record: 275,
    eighth: 832,
    eighthSlug: "832",
    date: "1945-02-15",
    dateLabel: "15 February 1945",
    target: "Cottbus",
    lat: 51.76101,
    lng: 14.33123,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Second day of the war, flown before the crew had been in combat forty-eight hours. The group lost two aircraft: Big Casino of the 335th, MACR 12378, and Easy Going of the 336th.",
  },
  {
    number: 3,
    record: 277,
    eighth: 835,
    eighthSlug: "835",
    date: "1945-02-19",
    dateLabel: "19 February 1945",
    target: "Osnabrück",
    lat: 52.27203,
    lng: 8.04555,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "Rail targets in the Ruhr corridor, escorted by Mustangs and Thunderbolts.",
    clipping: "1,100 Heavies Hit Nazi Rails",
  },
  {
    number: 4,
    record: 278,
    eighth: 836,
    eighthSlug: "836",
    date: "1945-02-20",
    dateLabel: "20 February 1945",
    target: "Nuremberg",
    lat: 49.45435,
    lng: 11.07346,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "First of two consecutive mornings over Nuremberg.",
    clipping: "900 Fortresses Rain Bombs, Incendiaries on Rail Center",
  },
  {
    number: 5,
    record: 279,
    eighth: 839,
    eighthSlug: "839",
    date: "1945-02-21",
    dateLabel: "21 February 1945",
    target: "Nuremberg",
    lat: 49.45435,
    lng: 11.07346,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "Second consecutive day at Nuremberg.",
    clipping: "P47s Blast Yards Near Hitler’s Den",
  },
  {
    number: 6,
    record: 280,
    eighth: 841,
    eighthSlug: "841",
    date: "1945-02-22",
    dateLabel: "22 February 1945",
    target: "Bamberg",
    lat: 49.89185,
    lng: 10.8929,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Stars and Stripes of 23 February reported six thousand aircraft against the German rail network. Bamberg is not in the story. Frank wrote it in the white margin in block capitals.",
    clipping: "Biggest Blitz Hits Nazis",
  },
  {
    number: 7,
    record: 281,
    eighth: 845,
    eighthSlug: "845",
    date: "1945-02-24",
    dateLabel: "24 February 1945",
    target: "Bremen",
    lat: 53.07538,
    lng: 8.80455,
    placeNote: "The surviving chart is hand-dated 23 February. The crew record puts this morning on the 24th. Both stand.",
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "Part of the fourteen-day run that produced 94 hours 35 minutes in February.",
  },
  {
    number: 8,
    record: 282,
    eighth: 847,
    eighthSlug: "847",
    date: "1945-02-25",
    dateLabel: "25 February 1945",
    target: "Munich",
    lat: 48.13641,
    lng: 11.57754,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Terminal rail station and marshalling yards in the city’s eastern and western districts. Fourth consecutive day the Eighth had thrown its weight against German communications.",
    clipping: "Rail-Hitting Heavies Tear Into Munich",
  },
  {
    number: 9,
    record: 284,
    eighth: 851,
    eighthSlug: "8th-air-force-851",
    date: "1945-02-27",
    dateLabel: "27 February 1945",
    target: "Leipzig",
    lat: 51.3452,
    lng: 12.38594,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "Ninth mission in fourteen days. Air Medal awarded this date, GO 289.",
  },
  {
    number: 10,
    record: 287,
    eighth: 861,
    eighthSlug: "861",
    date: "1945-03-03",
    dateLabel: "3 March 1945",
    target: "Brunswick",
    lat: 52.26546,
    lng: 10.5274,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "The 95th put up thirty-seven aircraft and lost one to a mid-air collision: Aunt Callie’s Baby and Paisano, both of the 335th. Nine killed. MACR 12889.",
  },
  {
    number: 11,
    record: 288,
    eighth: 863,
    eighthSlug: "863",
    date: "1945-03-04",
    dateLabel: "4 March 1945",
    target: "Ulm / Baumenheim",
    lat: 48.68001,
    lng: 10.82171,
    placeNote: "Primary was a Messerschmitt plant at Baumenheim; Ulm’s marshalling yard was the fallback under ten-tenths. The pin is a modern center between them, not an aim point.",
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Primary was a Messerschmitt components factory at Baumenheim; Ulm’s marshalling yard was the fallback under ten-tenths undercast. Wake at 0215.",
  },
  {
    number: 12,
    record: 292,
    eighth: 877,
    eighthSlug: "877",
    date: "1945-03-10",
    dateLabel: "10 March 1945",
    target: "Dortmunderfeld",
    lat: 51.50937,
    lng: 7.43493,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Industrial corridor the Eighth had been working since Chemnitz. Copilot for the day was Claude C. Greear, on loan from C.D. Crawford’s crew — the reverse of the February trade. Victor Probst flew the same morning in Poof Proof. No clipping in the scrapbook.",
  },
  {
    number: 13,
    record: 293,
    eighth: 883,
    eighthSlug: "883",
    date: "1945-03-12",
    dateLabel: "12 March 1945",
    target: "Swinemünde",
    lat: 53.90233,
    lng: 14.26896,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "German naval base on the Baltic, requested by Soviet command. A city swollen with civilian refugees. The crew flew it and came home. Nothing in the family’s record indicates what, if anything, Frank understood about the civilians below.",
    clipping: "Heavies Hit Near Rhine, Along Baltic",
  },
  {
    number: 14,
    record: 294,
    eighth: 886,
    eighthSlug: "886",
    date: "1945-03-14",
    dateLabel: "14 March 1945",
    target: "Seelze",
    lat: 52.39778,
    lng: 9.59241,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Among the roughest days that spring: 38 dispatched, 16 damaged, one lost, one written off after landing. The crew’s annotated captains’ chart for the day survives. Promoted to First Lieutenant the next day.",
  },
  {
    number: 15,
    record: 298,
    eighth: 896,
    eighthSlug: "896",
    date: "1945-03-19",
    dateLabel: "19 March 1945",
    target: "Jena",
    lat: 50.92696,
    lng: 11.58634,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Bombed through cloud along with Plauen. Escorts met Me 262s and Arado 234s — a jet bomber the crews had not met before.",
    clipping: "Plane Plants, Airfields Struck By 1,200 Heavies",
  },
  {
    number: 16,
    record: 299,
    eighth: 898,
    eighthSlug: "898",
    date: "1945-03-20",
    dateLabel: "20 March 1945",
    target: "Hamburg",
    lat: 53.55562,
    lng: 9.98745,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "Blohm+Voss shipyards. U-boat construction, still a priority this late in the war.",
    clipping: "Heavies Hit U-Boat Works",
  },
  {
    number: 17,
    record: 301,
    eighth: 906,
    eighthSlug: "8th-air-force-906",
    date: "1945-03-22",
    dateLabel: "22 March 1945",
    target: "Ahlhorn",
    lat: 52.90087,
    lng: 8.21076,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Luftwaffe airfield beginning to host Me 262s and Arado 234s. The crew record puts him here. The clipping kept against this page names Ingolstadt, Fürth and Grafenwöhr, not Ahlhorn.",
    clipping: "Few Enemy Planes Up, 22 KO’d",
  },
  {
    number: 18,
    record: 302,
    eighth: 908,
    eighthSlug: "8th-air-force-908",
    date: "1945-03-23",
    dateLabel: "23 March 1945",
    target: "Unna",
    lat: 51.53254,
    lng: 7.68693,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "Unna–Dortmund yards, among a dozen Ruhr targets.",
  },
  {
    number: 19,
    record: 304,
    eighth: 911,
    eighthSlug: "8th-air-force-911",
    date: "1945-03-24",
    dateLabel: "24 March 1945",
    target: "Ziegenhain",
    lat: 50.91066,
    lng: 9.23524,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "No clipping survives. A number in the scrapbook and nothing else.",
  },
  {
    number: 20,
    record: 305,
    eighth: 917,
    eighthSlug: "8th-air-force-917",
    date: "1945-03-28",
    dateLabel: "28 March 1945",
    target: "Hannover",
    lat: 52.37227,
    lng: 9.73815,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "Tank plants and a half-track factory at Hannover and Hildesheim.",
    clipping: "1,250 Heavies Strike Tank, Gun Factories Near Hanover",
  },
  {
    number: 21,
    record: 307,
    eighth: 920,
    eighthSlug: "8th-air-force-920",
    date: "1945-03-31",
    dateLabel: "31 March 1945",
    target: "Zeitz",
    lat: 51.05037,
    lng: 12.13417,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "Synthetic oil plant. Recovered from a wire report, not from the family scrapbook.",
  },
  {
    number: 22,
    record: 308,
    eighth: 924,
    eighthSlug: "8th-air-force-924",
    date: "1945-04-03",
    dateLabel: "3 April 1945",
    target: "Kiel",
    lat: 54.32325,
    lng: 10.13224,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "First of two consecutive days at Kiel.",
  },
  {
    number: 23,
    record: 309,
    eighth: 926,
    eighthSlug: "8th-air-force-926",
    date: "1945-04-04",
    dateLabel: "4 April 1945",
    target: "Kiel",
    lat: 54.32325,
    lng: 10.13224,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Second day. Nine bombers and four fighters lost across the Eighth; fifteen German aircraft claimed, eleven of them jets.",
    clipping: "Heavies Rock Kiel for 2nd Day",
  },
  {
    number: 24,
    record: 310,
    eighth: 928,
    eighthSlug: "8th-air-force-928",
    date: "1945-04-05",
    dateLabel: "5 April 1945",
    target: "Nuremberg",
    lat: 49.45435,
    lng: 11.07346,
    kind: "combat",
    aircraft: "44-8269 The Red Fox",
    notes:
      "Spirit of Martinez stood down for her third engine change. First of two missions in a borrowed ship. Numbered in the scrapbook the same as the rest — a record of a man, not an airplane.",
  },
  {
    number: 25,
    record: 312,
    eighth: 931,
    eighthSlug: "8th-air-force-931",
    date: "1945-04-07",
    dateLabel: "7 April 1945",
    target: "Kaltenkirchen",
    lat: 53.83813,
    lng: 9.95973,
    kind: "combat",
    aircraft: "43-38942 Belligerent Beauty",
    notes:
      "Second borrowed-aircraft mission. Third oak leaf cluster awarded this date, GO 720. Wilcox in the ball; Collins not aboard. Mathis as observer.",
  },
  {
    number: 26,
    record: 314,
    eighth: 935,
    eighthSlug: "8th-air-force-935",
    date: "1945-04-09",
    dateLabel: "9 April 1945",
    target: "München-Riem",
    lat: 48.14067,
    lng: 11.68164,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Back in the Spirit. Airfields around Munich believed to be bases for jet fighters. Third straight day the Eighth put more than a thousand bombers in the air. Wilcox still in the ball; Mathis still observing. Collins not on this roster.",
    clipping: "1,250 Heavies Strike Munich",
  },
  {
    number: 27,
    record: 315,
    eighth: 938,
    eighthSlug: "8th-air-force-938",
    date: "1945-04-10",
    dateLabel: "10 April 1945",
    target: "Burg",
    lat: 52.27066,
    lng: 11.85557,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Jet airfields in the arc around Berlin. The scrapbook names Burg among seven fields struck. Wilcox in the ball; Gearn observing. Collins not aboard.",
  },
  {
    number: 28,
    record: 321,
    eighth: 962,
    eighthSlug: "8th-air-force-962",
    date: "1945-04-20",
    dateLabel: "20 April 1945",
    target: "Oranienburg",
    lat: 52.75592,
    lng: 13.24484,
    kind: "combat",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Last combat mission. Rail yards ringing Berlin. Hitler’s birthday. The scrapbook stops here. The three food drops that followed carry no number at all.",
  },
  {
    number: 29,
    record: 324,
    date: "1945-05-03",
    dateLabel: "3 May 1945",
    target: "Utrecht — Lage Weide",
    lat: 52.11119,
    lng: 5.07102,
    kind: "humanitarian",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Operation Chowhound. Flour, tinned meat, chocolate, powdered milk, dropped at about four hundred feet. Chowhound Three for the group.",
  },
  {
    number: 30,
    record: 325,
    date: "1945-05-05",
    dateLabel: "5 May 1945",
    target: "Utrecht — Lage Weide",
    lat: 52.11119,
    lng: 5.07102,
    kind: "humanitarian",
    aircraft: "44-6838 Spirit of Martinez",
    notes: "Chowhound Four. The informal truce with German flak crews still held.",
  },
  {
    number: 31,
    record: 326,
    date: "1945-05-06",
    dateLabel: "6 May 1945",
    target: "Utrecht — Lage Weide",
    lat: 52.11119,
    lng: 5.07102,
    kind: "humanitarian",
    aircraft: "44-6838 Spirit of Martinez",
    notes:
      "Chowhound Five, the day before the war in Europe ended. White bread that, to children who had lived on beet pulp, tasted like cake.",
  },
];
