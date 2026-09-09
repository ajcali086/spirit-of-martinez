import type { CrewMember, RecordLink } from "./types";

export function bgdbPersonUrl(id: number) {
  return `https://95thbgdb.com/person/${id}`;
}

export function crewRecordLinks(member: CrewMember): RecordLink[] {
  return [
    {
      href: bgdbPersonUrl(member.person),
      label: "95th BG database",
      note: "Modern compilation of the group’s crew record. Not a paper issued at Horham.",
    },
    ...(member.records ?? []),
  ];
}

export const crew: CrewMember[] = [
  {
    id: "calicura",
    name: "Frank J. Calicura",
    role: "Pilot",
    hometown: "Martinez, California",
    person: 964,
    wartime:
      "Born 1921, son of Saverio and Angelina, one of seventeen. Learned to fly on the waterfront strip his eldest brother built. Commissioned 15 April 1944 at Turner Field. First lieutenant, serial O-828662, 335th Bomb Squadron, 95th Bomb Group. Twenty-eight combat missions, three humanitarian drops, 208 combat hours.",
    after:
      "Came home a first lieutenant with a commercial ticket and an instructor’s endorsement. Cut meat with his brother Bill on Main Street. Died in 1962.",
  },
  {
    id: "probst",
    name: "Victor G. Probst",
    role: "Copilot",
    hometown: "Yoakum, Texas",
    person: 5405,
    wartime:
      "Right-hand seat for the tour, except the first morning — traded into The Red Fox so a veteran copilot could take a new crew over Germany. Later studied architecture.",
    after:
      "Returned to England to study architecture at the University of London, then co-founded a Texas firm that designed hospitals, including Houston’s St. Luke’s and Texas Children’s.",
  },
  {
    id: "barnes",
    name: "John R. Barnes",
    role: "Navigator",
    hometown: "Emporium, Pennsylvania",
    person: 314,
    wartime:
      "Born Philadelphia, 31 January 1922, son of Leonard and Gertrude Barnes. Added to the crew at Avon Park on 6 November 1944; he is the ninth name, the one missing from the Tampa order.",
    after:
      "Earned a doctorate at Penn State. Spent much of his career as Director of Pathology at DuPont’s Haskell Laboratory, retiring in 1982. Died 2 June 2011 in Wellsboro, Pennsylvania, age eighty-nine.",
    photo: "barnes",
    records: [
      {
        href: "https://americanarchive.iwm.org.uk/archive/person/john-r-barnes",
        label: "IWM American Archive",
        note: "Identifies him as navigator of the Spirit of Martinez. Drawn from the National Museum of the Mighty Eighth Air Force. A modern compilation, not a paper issued at Horham. The biography was supplied in part by his son.",
      },
      {
        href: "https://americanairmuseum.com/person/127516",
        label: "American Air Museum",
        note: "The other copy of that same entry.",
      },
    ],
  },
  {
    id: "markus",
    name: "Marvin L. Markus",
    role: "Togglier",
    hometown: "Kingfisher, Oklahoma",
    person: 4208,
    wartime:
      "The town already named on the wallet that would later be stamped for the crew. Flew the nose of the Spirit of Martinez.",
    after:
      "Married Dorothy Ellen O’Niel in July 1945 — sixty-nine years. Built an automotive-electric business across several towns and retired in 2003. His 2015 obituary remembered his war in a single number: twenty-eight full bombing runs. Died 30 March 2015, age eighty-nine, and was buried at Kingfisher County Memorial Cemetery with full military rites.",
    photo: "pair",
    records: [
      {
        href: "https://okcemeteries.net/kingfisher/kingfisher/m/markusmlobit.htm",
        label: "Bartlesville Examiner-Enterprise",
        note: "The 2015 obituary, as reprinted. The source of the twenty-eight full bombing runs. What that family told a paper after he was gone.",
      },
      {
        href: "https://www.stumpff.org/obituaries/Marvin-Markus-22556/",
        label: "Stumpff Funeral Home",
        note: "The funeral-home listing. Same death, a shorter notice.",
      },
    ],
  },
  {
    id: "bogacki",
    name: "Earle F. Bogacki",
    role: "Flight engineer / top turret",
    hometown: "Cleveland, Ohio",
    person: 575,
    wartime:
      "Born 1920 to Frank and Stella Bojack, a surname later changed to Bogacki — which is very likely why a contemporary wallet clipping printed “Nogacki” and still got the city right.",
    after:
      "Stayed in uniform thirty-one years, rising to Chief Master Sergeant through Korea and Vietnam. Married Emily “Lu” McGrath on 3 May 1952. Died 14 February 2011 at ninety, buried with full military honors.",
    photo: "bogacki",
    records: [
      {
        href: "https://www.wkbn.com/my-valley-tributes/emily-lu-bogacki-greenville-pa/",
        label: "Emily “Lu” Bogacki",
        note: "Her 2020 obituary. Names him, and the rank. Not his own page.",
      },
    ],
  },
  {
    id: "brown",
    name: "Robert J. Brown",
    role: "Radio operator",
    hometown: "Corning, New York",
    person: 779,
    wartime:
      "Born 1 May 1924 to a Polish immigrant father. Radio on the Spirit from the first morning at Chemnitz.",
    after:
      "Married in Manhattan in December 1947. The license is the last documented trace of him found.",
    photo: "brown",
  },
  {
    id: "collins",
    name: "Robert E. Collins",
    role: "Ball turret",
    hometown: "Hutchinson, Kansas",
    person: 1249,
    wartime:
      "Born 5 October 1923. Draft card lists the Coca-Cola Bottling Company and a boss named Lewis Scruggs. Not yet twenty when he registered. The ball turret of a B-17 became his job instead.",
    after:
      "Signed the Hunter Field shipping ticket of 13 December 1944 in a hand consistent with the draft card. Later life is otherwise thin in the record.",
  },
  {
    id: "ernest",
    name: "Dale S. Ernest",
    role: "Waist gunner",
    hometown: "West Virginia",
    person: 1935,
    wartime:
      "Present with the crew at Avon Park in the autumn of 1944 — the same window a later VA statement describes as the onset of Frank’s back injury.",
    after:
      "West Virginia University, then the Naval Ordnance Laboratory. By January 1959 he held a patent for an automatic depth-correcting device for moored mines. Visited Martinez that same year — “Dale Ernest + Dau, ’59,” in Jimmy Calicura’s slide index. Died in 2007.",
  },
  {
    id: "titus",
    name: "James A. Titus",
    role: "Tail gunner",
    hometown: "Lincoln, Nebraska",
    person: 6711,
    wartime:
      "Gunnery school at Las Vegas, June 1944. Contemporary clippings from a Lincoln paper state plainly that he served in England as tail gunner on a B-17.",
    after:
      "Discharged as a sergeant from Lincoln Army Air Field. Parents: Mr. and Mrs. Joe B. Titus of 3343 LaSalle Street. Later record remains thin.",
    photo: "titus",
  },
];

export function crewById(id: string) {
  return crew.find((m) => m.id === id);
}

export function adjacentCrew(id: string) {
  const i = crew.findIndex((m) => m.id === id);
  return {
    prev: i > 0 ? crew[i - 1] : undefined,
    next: i >= 0 && i < crew.length - 1 ? crew[i + 1] : undefined,
    index: i,
    total: crew.length,
  };
}
