export type PhotoId =
  | "crew"
  | "naming"
  | "london"
  | "watts"
  | "gazette"
  | "birth"
  | "wallet"
  | "jacket"
  | "patch"
  | "nose"
  | "hamburg"
  | "chart7"
  | "form5"
  | "letter"
  | "snorter"
  | "ticket"
  | "quals"
  | "airfield"
  | "shop"
  | "biro"
  | "brown"
  | "barnes"
  | "titus"
  | "bogacki"
  | "crew2"
  | "will"
  | "brothers"
  | "jimmy"
  | "pair"
  | "joyce"
  | "redbar"
  | "beatie"
  | "richard"
  | "jimmy1"
  | "merit"
  | "promotion"
  | "medical"
  | "rating"
  | "greenville"
  | "instrument"
  | "idcard"
  | "stuart"
  | "go289";

export type Block =
  | { type: "p"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "note"; text: string }
  | { type: "artifact"; title: string; body: string }
  | { type: "figure"; id: PhotoId; caption?: string };

export type Section = {
  id: string;
  title: string;
  place?: string;
  blocks: Block[];
};

export type Chapter = {
  number: number;
  slug: string;
  title: string;
  kicker: string;
  years: string;
  image: string;
  imageAlt: string;
  imagePosition?: "top" | "center";
  dek: string;
  sections: Section[];
};

export type MissionKind = "combat" | "humanitarian";

export type Mission = {
  number: number;
  record: number;
  date: string;
  dateLabel: string;
  target: string;
  kind: MissionKind;
  aircraft: string;
  notes: string;
  clipping?: string;
  /** Eighth Air Force mission number. Combat only. */
  eighth?: number;
  /** IWM American Archive URL slug. Combat only. */
  eighthSlug?: string;
};

export type CrewMember = {
  id: string;
  name: string;
  role: string;
  hometown: string;
  wartime: string;
  after: string;
  photo?: PhotoId;
  /** 95th Bomb Group database person id. Modern compilation, not a paper issued at Horham. */
  person: number;
};

export type TimelineEvent = {
  id: string;
  date: string;
  year: number;
  title: string;
  body: string;
  href?: string;
  era: "before" | "training" | "combat" | "after";
};

export type CountQuestion = {
  figure: string;
  label: string;
  body: string;
};

export type OpenQuestion = {
  title: string;
  body: string;
};
