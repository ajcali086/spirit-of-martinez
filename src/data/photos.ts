import type { PhotoId } from "./types";

export type PhotoKind = "photograph" | "object";

export type ArchivePhoto = {
  id: PhotoId;
  title: string;
  date?: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  credit: string;
  kind: PhotoKind;
  maxWidth?: "sm" | "lg" | "xl";
};

export const photos: Record<PhotoId, ArchivePhoto> = {
  crew: {
    id: "crew",
    title: "The crew of 44-6838",
    date: "1945",
    src: "/images/archive/crew",
    width: 1500,
    height: 1189,
    alt: "Nine airmen posed in two rows under the nose of a B-17 painted Spirit of Martinez",
    caption:
      "The crew of 44-6838, Spirit of Martinez, on the hardstand at Horham, 1945. The name is already on the nose — this is the ship after the Army caught up to what the men had decided to call her.",
    credit: "Family collection",
    kind: "photograph",
  },
  naming: {
    id: "naming",
    title: "Under the nose",
    date: "1945",
    src: "/images/archive/naming",
    width: 1100,
    height: 1394,
    alt: "Three officers standing under the painted nose of Spirit of Martinez, two of them shaking hands",
    caption:
      "Under the nose, 1945. Frank Calicura in flying kit at left; Capt. David Olsson — another Martinez man — in the overcoat; Col. Jack E. Shuck, group commander, taking the handshake. The book records the moment as official recognition, not a friendship.",
    credit: "Family collection",
    kind: "photograph",
  },
  nose: {
    id: "nose",
    title: "Frank at the nose",
    date: "14 February 1945",
    src: "/images/archive/nose",
    width: 1500,
    height: 1166,
    alt: "Frank Calicura in flying kit standing at the painted nose of a B-17, his hand on the word MARTINEZ",
    caption:
      "Frank Calicura at the nose of 44-6838, Horham, 14 February 1945 — the morning of mission one. The name is already on the ship.",
    credit: "Family collection",
    kind: "photograph",
  },
  london: {
    id: "london",
    title: "A London pass",
    date: "1945",
    src: "/images/archive/london",
    width: 1500,
    height: 932,
    alt: "Three American officers in greatcoats walking a wet London street, a double-decker bus behind them",
    caption:
      "A London pass. The mission reports document targets, tonnage, losses, and times. They document nothing about a wet street, a snack bar, or a Soho card carried back in a uniform pocket.",
    credit: "Family collection",
    kind: "photograph",
  },
  watts: {
    id: "watts",
    title: "Watts Towers",
    date: "c. 1958",
    src: "/images/archive/watts",
    width: 1000,
    height: 1472,
    alt: "Frank Calicura and his young son Samuel standing with arms folded in front of the Watts Towers",
    caption:
      "The other direction. Frank Calicura and his son Samuel outside the Watts Towers, on a stop the family places during a trip to Disneyland, about 1958. Samuel was born in 1952.",
    credit: "Family collection",
    kind: "photograph",
  },
  gazette: {
    id: "gazette",
    title: "At the Gazette",
    date: "summer 1945",
    src: "/images/archive/gazette",
    width: 1198,
    height: 1200,
    alt: "First Lieutenant Frank Calicura in khaki uniform seated beside bound volumes of the Contra Costa Gazette",
    caption:
      "Frank Calicura at the Contra Costa Gazette, Martinez, summer 1945. Bound volumes of the county paper stand at his shoulder — the same paper that had been printing him since he enlisted. First lieutenant, pilot wings, the ribbon bar the service coat still carries.",
    credit: "Family collection",
    kind: "photograph",
    maxWidth: "lg",
  },
  hamburg: {
    id: "hamburg",
    title: "Hamburg",
    date: "20 March 1945",
    src: "/images/archive/hamburg",
    width: 1500,
    height: 1020,
    alt: "Vertical aerial photograph of a port city, smoke rising from docks and rail yards along a river",
    caption:
      "Hamburg, 20 March 1945. Mission sixteen, Blohm+Voss. Smoke over the yards — the kind of image the Eighth produced by the thousands that spring to document what a mission had or had not accomplished.",
    credit: "Family collection",
    kind: "photograph",
  },
  birth: {
    id: "birth",
    title: "Birth announcement",
    date: "20 June 1944",
    src: "/images/archive/birth",
    width: 1400,
    height: 788,
    alt: "Handmade birth announcement painted as laundry on a clothesline for Frank James Calicura Jr., born June 20, 1944",
    caption:
      "We’re simply “BUSTIN’” to tell you. It’s a boy, born 6/20/44 at 3:15 p.m., named Frank James Calicura Jr., seven pounds seven ounces. Proud Mama and Papa, Joyce & Frank Calicura. The card went to Hendricks Field. He had not yet seen the child.",
    credit: "Family collection",
    kind: "object",
  },
  wallet: {
    id: "wallet",
    title: "The Kiwanis wallet",
    date: "1945",
    src: "/images/archive/wallet",
    width: 450,
    height: 800,
    alt: "A worn black leather wallet stamped in gold Lt. Frank Calicura The Spirit of Martinez",
    caption:
      "Lt. Frank Calicura, ‘The Spirit of Martinez’. One of nine wallets the Martinez Kiwanis Club sent to Horham that spring, good leather, stamped for a war in the Pacific that never came. He moved his cards into it the week it arrived.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "sm",
  },
  jacket: {
    id: "jacket",
    title: "The B-15",
    src: "/images/archive/jacket",
    width: 1400,
    height: 1294,
    alt: "Painted B-17 Spirit of Martinez, serial 6838, call sign E, over two rows of yellow bomb symbols on an olive flight jacket",
    caption:
      "The B-15. Spirit of Martinez, tail 6838, call sign E, thirty bomb symbols. Subtract two mornings in borrowed ships and the crew record accounts for twenty-nine. The jacket and the database disagree by one.",
    credit: "Family collection",
    kind: "object",
  },
  patch: {
    id: "patch",
    title: "Eighth Air Force patch",
    src: "/images/archive/patch",
    width: 727,
    height: 900,
    alt: "Embroidered Eighth Air Force shoulder patch: a golden winged 8 on blue, a white star with a red center",
    caption:
      "From the shoulder of his Ike jacket. The Eighth Air Force: a winged 8, a white star, a red center. The command that sent him to Chemnitz, and then to Utrecht.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "sm",
  },
  form5: {
    id: "form5",
    title: "Individual Flight Record",
    date: "February 1945",
    src: "/images/archive/form5",
    width: 1093,
    height: 1400,
    alt: "AAF Form 5 Individual Flight Record for 2nd Lt. Frank J. Calicura, February 1945, certified by Capt. David E. Olsson",
    caption:
      "The individual flight record for February 1945. Calicura, Frank J., 2nd Lt., serial O-828662, 335th Bomb Squadron, 95th Bomb Group. This month: 94 hours 35 minutes. Certified by Capt. David E. Olsson, Assistant Operations Officer — the same Martinez man who later stands in the overcoat under the nose. The form states the hours. It does not state what a man carried home.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "lg",
  },
  letter: {
    id: "letter",
    title: "If the People at Home Only Knew",
    date: "21 April 1945",
    src: "/images/archive/letter",
    width: 1200,
    height: 1002,
    alt: "Newspaper clipping of a letter titled If the People at Home Only Knew, signed Frank Calicura, England, 21 April 1945",
    caption:
      "England, 21 April 1945. To Ray Taylor, later printed under the title “If the People at Home Only Knew.” Twenty-eight combat missions, seven still to go; the Spirit stood down for her third engine change; not once an abort. “We should be the honored ones, in having the people at home asking us to name it after our town.”",
    credit: "Family collection",
    kind: "object",
  },
  chart7: {
    id: "chart7",
    title: "Mission #7 map",
    date: "23 February 1945",
    src: "/images/archive/chart7",
    width: 1200,
    height: 1416,
    alt: "Printed captains’ map of northwest Europe, hand-labeled Mission #7, 23 Feb. 1945, with a penciled route, times, and pink flak shading",
    caption:
      "Captains of Aircraft Map, Newcastle to Prague. Hand-dated 23 Feb. 1945 and numbered Mission #7. Control points, an IP, an RP, fighters, flak in colored pencil. The crew record puts mission seven on the 24th, at Bremen. Whose hand made the annotations is not established here. The flak is planned intelligence; the times are briefed times.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "xl",
  },
  snorter: {
    id: "snorter",
    title: "The short snorter",
    src: "/images/archive/snorter",
    width: 1500,
    height: 642,
    alt: "A worn one-dollar silver certificate covered in overlapping wartime signatures, Washington at the center",
    caption:
      "The short snorter. Charles Beatie’s name is on it — the man who helped drag a runway into the Martinez fill. Frank signed it as 1st Lt., AAF. Dominic signed it. The Army did not require it, did not track it, and would not have cared if it were lost.",
    credit: "Family collection",
    kind: "object",
  },
  ticket: {
    id: "ticket",
    title: "Shipping ticket",
    date: "13 December 1944",
    src: "/images/archive/ticket",
    width: 1500,
    height: 1030,
    alt: "Mimeographed shipping ticket of 13 December 1944, Grenier Field, signed by nine of the crew plus a tenth name, for B-11 flying jackets and A-10 trousers",
    caption:
      "Grenier Field, Manchester, New Hampshire, 13 December 1944. Issued out of Hunter Field. Crew FQ-555-CA-93 signing for ten B-11 flying jackets and ten pair of A-10 trousers. Airplane 44-6830 — not the Spirit. Eight serials away, same shed, same month; the ferry ship they gave up on the far side of the Atlantic. A tenth signature, Eugene P. Allamano, RAD, is a passenger, not crew.",
    credit: "Family collection",
    kind: "object",
  },
  quals: {
    id: "quals",
    title: "Qualification record",
    src: "/images/archive/quals",
    width: 1500,
    height: 614,
    alt: "Typed civilian education and occupation block from Frank Calicura’s qualification record: Alhambra High 1938, Bay City Flyers, meat cutter",
    caption:
      "The Army’s own form. Twelfth grade, Alhambra Union High School, 1938. Three months of Civilian Pilot Training at Bay City Flyers, Concord. Occupation: meat cutter, Sam Calicura, 726 Ferry Street, Martinez. The book has him cutting meat at the Star Meat Market on Main Street. Both addresses are in the record. They are not the same, and this page does not reconcile them.",
    credit: "Family collection",
    kind: "object",
  },
  airfield: {
    id: "airfield",
    title: "Martinez Airport from the air",
    date: "c. 1940",
    src: "/images/archive/airfield",
    width: 1500,
    height: 1074,
    alt: "Aerial view of Martinez Airport: a dirt strip on filled ground beside railroad tracks, a hangar lettered MARTINEZ AIRPORT, light aircraft and cars",
    caption:
      "The strip by the tracks. Filled ground along the Southern Pacific, a hangar lettered MARTINEZ AIRPORT, the wires Sam Calicura Jr. spent years trying to get moved. Two men dragged this runway into city fill. One of them taught his brothers to fly on it.",
    credit: "Beatie family collection",
    kind: "photograph",
  },
  shop: {
    id: "shop",
    title: "At the block",
    src: "/images/archive/shop",
    width: 1500,
    height: 1169,
    alt: "Frank Calicura in a white shirt and butcher’s apron working a cutting block in a shop lined with refrigerated cases",
    caption:
      "Frank Calicura at the block. He went to cut meat for his brother in 1938, flew a war, and came back to the same trade. By 1955 he and Bill had their own renovated quarters at 700 Main Street. The qualification record had typed it: meat cutter.",
    credit: "Family collection",
    kind: "photograph",
  },
  biro: {
    id: "biro",
    title: "Billy at the Biro",
    date: "August 1955",
    src: "/images/archive/biro",
    width: 1500,
    height: 958,
    alt: "A butcher working a Biro bandsaw, a hanging carcass in the open cooler behind him, a third figure in shadow",
    caption:
      "August 1955, Calicura Bros. Meats. Billy at the Biro, a hanging carcass in the cooler. In the shadow behind him the family identifies a third man: Sabato Rodia. The wall calendar that dates the companion plates is not in this frame.",
    credit: "Family collection",
    kind: "photograph",
  },
  brown: {
    id: "brown",
    title: "Robert J. Brown",
    date: "1945",
    src: "/images/archive/brown",
    width: 1048,
    height: 1346,
    alt: "Radio operator Robert J. Brown at his set, oxygen mask on, a round window behind him",
    caption:
      "Robert J. Brown at the radio, Spirit of Martinez. Oxygen on, headset on, the set in front of him. The name on the print was added later.",
    credit: "Family collection",
    kind: "photograph",
  },
  barnes: {
    id: "barnes",
    title: "John R. Barnes",
    date: "1945",
    src: "/images/archive/barnes",
    width: 1110,
    height: 1500,
    alt: "Navigator John R. Barnes at a B-17 window, backlit, another airman behind him",
    caption:
      "John R. Barnes, navigator. The second man is not labeled on the print. The name in the corner was added later.",
    credit: "Family collection",
    kind: "photograph",
  },
  titus: {
    id: "titus",
    title: "James A. Titus",
    date: "1945",
    src: "/images/archive/titus",
    width: 1163,
    height: 1331,
    alt: "Tail gunner James A. Titus in leather helmet and oxygen mask, close to the camera",
    caption:
      "James A. Titus, tail gunner. Full face gear at altitude. A Lincoln paper stated plainly that he served in England as tail gunner on a B-17.",
    credit: "Family collection",
    kind: "photograph",
  },
  bogacki: {
    id: "bogacki",
    title: "Earle F. Bogacki",
    date: "1945",
    src: "/images/archive/bogacki",
    width: 1140,
    height: 1493,
    alt: "Flight engineer Earle F. Bogacki in a B-17, looking down at a chart, a hatch open above him",
    caption:
      "Earle F. Bogacki, flight engineer. A chart in his hands and the hatch above him. The name on the print was added later.",
    credit: "Family collection",
    kind: "photograph",
  },
  crew2: {
    id: "crew2",
    title: "Seven of the nine",
    src: "/images/archive/crew2",
    width: 1353,
    height: 1048,
    alt: "Seven of the Spirit of Martinez crew standing on gravel in flying jackets, two wearing parachute harnesses",
    caption:
      "Seven of the nine. The collection does not label the plate, or say whether this is Florida or Suffolk. Two men are in harness. The under-nose portrait at Horham has all nine.",
    credit: "Family collection",
    kind: "photograph",
  },
  will: {
    id: "will",
    title: "Last will and testament",
    date: "7 September 1944",
    src: "/images/archive/will",
    width: 843,
    height: 1500,
    alt: "Typed last will and testament of Frank James Calicura, signed at Avon Park Army Air Field, 7 September 1944",
    caption:
      "Avon Park, 7 September 1944. Second Lieutenant Frank James Calicura, serial O-828662, 325th AAF Base Unit. The entire estate to Joyce B. Calicura of 731 Mellus Street; if she does not survive him, to his brother Sam of 3120 Ricks Court. Witnesses: Cpl. Clarence E. Rither of Anoka, Minn., and Pfc. Thomas C. Dykes of Lexington, Ky. He had not yet flown a combat mission.",
    credit: "Family collection",
    kind: "object",
  },
  brothers: {
    id: "brothers",
    title: "Frank and Dominic",
    date: "c. 1944",
    src: "/images/archive/brothers",
    width: 1500,
    height: 928,
    alt: "Frank and Dominic Calicura in officer’s uniforms at a table, glasses in hand, the album page captioned Frank and Dominick Calicura",
    caption:
      "Frank and Dominic. The album is captioned in period hand, “Frank & Dominick Calicura.” Pilot wings on both men. A Gazette clipping puts the brothers together in New York in December 1944 — Dominic instructing fighters in Georgia, Frank waiting for the European Theatre. Nothing in either source fixes this table as that meeting. The timing fits.",
    credit: "Family collection",
    kind: "photograph",
  },
  jimmy: {
    id: "jimmy",
    title: "Frank and Jimmy",
    src: "/images/archive/jimmy",
    width: 1058,
    height: 1500,
    alt: "Frank Calicura in khaki, Eighth Air Force patch on the shoulder, kneeling on a sidewalk with a toddler in a hat and striped shorts",
    caption:
      "Frank and Frank Jr. — Jimmy, on his feet. Eighth Air Force patch on the shoulder, so after the tour. The one-month-old photograph from the window in July 1944 is a different plate. This is later: a boy old enough to stand, a father home long enough to kneel beside him.",
    credit: "Family collection",
    kind: "photograph",
  },
  pair: {
    id: "pair",
    title: "Collins and Markus",
    src: "/images/archive/pair",
    width: 900,
    height: 1316,
    alt: "Robert E. Collins and Marvin L. Markus sitting on a hillside in flying jackets, both wearing ball caps",
    caption:
      "Robert E. Collins, ball turret, at left; Marvin L. Markus, togglier, at right. A 95th Bomb Group photograph. A later overlay on the print spelled Markus as Marcus. The book keeps the spelling the Army used.",
    credit: "Family collection",
    kind: "photograph",
  },
  joyce: {
    id: "joyce",
    title: "Joyce and Frank, Maxwell Field",
    date: "1943",
    src: "/images/archive/joyce",
    width: 1212,
    height: 1500,
    alt: "Joyce and Frank Calicura standing together under pine trees: he in khaki, she in a floral dress, Maxwell Field, 1943",
    caption:
      "Joyce and Frank, Maxwell Field, 1943. Kodachrome. She crossed the country on the chance a ten-week course would still have him there when the train arrived. The collection’s own note on the slide ties it to what came nine months later: a son.",
    credit: "Family collection",
    kind: "photograph",
  },
  richard: {
    id: "richard",
    title: "Sam and Richard",
    date: "early 1940s",
    src: "/images/archive/richard",
    width: 1024,
    height: 767,
    alt: "Sam Calicura Jr. in a suit and tie with his young son Richard, also in a suit, early 1940s",
    caption:
      "Sam Calicura Jr. and his son Richard, born 1934. Suits and ties, early 1940s. He appears in the family’s photographs the way he appears in its history — present, central, and rarely the subject.",
    credit: "Family collection",
    kind: "photograph",
  },
  beatie: {
    id: "beatie",
    title: "Beatie and Sam, Curtiss Robin",
    date: "July 1942",
    src: "/images/archive/beatie",
    width: 688,
    height: 510,
    alt: "Newspaper photograph of Charles Beatie and Sam Calicura standing beside a Curtiss Robin biplane",
    caption:
      "Charles Beatie (left) and Sam Calicura Jr. beside their Curtiss Robin. Caption as printed: flight chairman and vice president of the Metropolitan Oakland AOPA unit. Flying, July 1942. The same two men who had dragged a runway into the Martinez fill.",
    credit: "Family collection",
    kind: "photograph",
  },
  redbar: {
    id: "redbar",
    title: "The Red Bar",
    date: "1945",
    src: "/images/archive/redbar",
    width: 1488,
    height: 908,
    alt: "Worn paper membership card for The Red Bar, 8 Green’s Court off Brewer Street, Soho, London W.1",
    caption:
      "The Red Bar, 8 Green’s Court, off Brewer Street, Soho. Open 2.30 to 10. THIS CARD CANNOT BE SOLD. Carried back from a London pass and kept in a uniform pocket. The mission reports document nothing about it.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "lg",
  },
  jimmy1: {
    id: "jimmy1",
    title: "Jimmy, about one year",
    date: "c. 1945",
    src: "/images/archive/jimmy1",
    width: 1044,
    height: 1500,
    alt: "A toddler in a yellow romper on a sunny sidewalk, holding a red flower in one fist",
    caption:
      "Frank James Calicura Jr. — Jimmy — about a year old, which would be the summer his father came home. Color slide. The collection does not label the street.",
    credit: "Family collection",
    kind: "photograph",
  },
  merit: {
    id: "merit",
    title: "Award of Merit",
    date: "1939",
    src: "/images/archive/merit",
    width: 1800,
    height: 1361,
    alt: "Award of Merit certificate from the 1939 Golden Gate International Exposition, presented to Frank Calicura for a gas model hydroplane meet, signed Leland W. Cutler",
    caption:
      "Award of Merit, 1939. Golden Gate International Exposition, Treasure Island. Presented to Frank Calicura. The event, in his own hand: Gas Model Hydroplane Meet. Signed Leland W. Cutler, president of the exposition. Outstanding junior citizen.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "xl",
  },
  promotion: {
    id: "promotion",
    title: "Certificate of Promotion",
    date: "21 June 1935",
    src: "/images/archive/promotion",
    width: 1800,
    height: 1507,
    alt: "Certificate of Promotion sending Frank J. Calicura from Martinez Junior High to senior high school, dated June 21, 1935",
    caption:
      "Certificate of Promotion to senior high, Alhambra Union High School District. Frank J. Calicura. Given at Martinez, June 21, 1935. Three years before the yearbook.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "xl",
  },
  rating: {
    id: "rating",
    title: "Airman Rating Record",
    date: "4 August 1947",
    src: "/images/archive/rating",
    width: 1800,
    height: 1327,
    alt: "Civil Aeronautics Administration Airman Rating Record no. 107645 for Frank James Calicura, commercial pilot and flight instructor, issued August 4, 1947",
    caption:
      "Airman Rating Record no. 107645, 4 August 1947. Commercial pilot — airplane, single- and multi-engine land. Flight instructor, 30 September 1947. 731 Mellus Street. The Army was finished with him. The CAA was not.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "xl",
  },
  medical: {
    id: "medical",
    title: "CAA medical certificate",
    date: "7 July 1948",
    src: "/images/archive/medical",
    width: 1800,
    height: 1189,
    alt: "CAA medical certificate for commercial airmen, Second Class, Frank James Calicura of 731 Mellus Street, examined July 7, 1948, limitations none",
    caption:
      "CAA Form ACA 1004. Second Class Airmen, examined 7 July 1948. 731 Mellus Street. Date of birth 4/4/21. 148½ pounds, 70 inches. Limitations: none. His signature.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "xl",
  },
  greenville: {
    id: "greenville",
    title: "Greenville Aviation School",
    date: "1943",
    src: "/images/archive/greenville",
    width: 1800,
    height: 1430,
    alt: "Greenville Aviation School certificate completing the Primary Training Course for Aviation Cadet Frank James Calicura, Ocala, Florida",
    caption:
      "Greenville Aviation School, Ocala. Flight contractors to the Army Air Forces. Aviation Cadet Frank James Calicura, Primary Training Course, Southeast Training Center. Signed E. G. Cooper, Frank A. Hanley, A. L. Cummins. The paper names the school. The cartoon named the solo.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "xl",
  },
  instrument: {
    id: "instrument",
    title: "Instrument flight test",
    date: "15 April 1944",
    src: "/images/archive/instrument",
    width: 1180,
    height: 1800,
    alt: "A.A.F. Form No. 8 instrument flight test certificate for 2nd Lt. Frank J. Calicura, Turner Field, Georgia, 15 April 1944",
    caption:
      "A.A.F. Form No. 8. 2nd Lt. Frank J. Calicura passed the instrument flight test, Turner Field, Georgia, 15 April 1944. John B. Patrick, Colonel. Wm. H. Jenkins, Major, check pilot. Same day as the bars.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "lg",
  },
  idcard: {
    id: "idcard",
    title: "Identity card",
    date: "15 April 1944",
    src: "/images/archive/idcard",
    width: 1800,
    height: 1473,
    alt: "Army Air Forces identity card for 2nd Lt. Frank J. Calicura, issued 15 April 1944, with height-chart portrait and right-hand fingerprints",
    caption:
      "Issued 15 April 1944. Date of birth 4 April 1921. Brown, brown. 155 lbs. 5 ft. 9 in. The silvering on the portrait is the photograph, not the man. Right hand, thumb last.",
    credit: "Family collection",
    kind: "photograph",
    maxWidth: "xl",
  },
  stuart: {
    id: "stuart",
    title: "Stuart’s memorandum",
    date: "8 May 1945",
    src: "/images/archive/stuart",
    width: 1800,
    height: 1617,
    alt: "Memorandum dated 8 May 1945 from Lt. Col. Robert H. Stuart certifying 28 operational missions and 208 combat hours for 1st Lt. Frank J. Calicura",
    caption:
      "Headquarters, 95th Bombardment Group (H), 8 May 1945. Twenty-eight operational missions. Two hundred eight hours. Air Medal and three clusters, by general-order number. Recommended: Instructor, Flying Training Command. Robert H. Stuart, Lt. Colonel, Air Corps, Commanding. It does not count the food.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "lg",
  },
  go289: {
    id: "go289",
    title: "General Orders 289",
    date: "27 February 1945",
    src: "/images/archive/go289",
    width: 1493,
    height: 1800,
    alt: "General Orders Number 289, Headquarters 3rd Air Division, 27 February 1945, awarding the Air Medal, with a handwritten check beside Frank J. Calicura",
    caption:
      "GO 289, 27 February 1945. Air Medal. 95th Bombardment Group (H). A mark beside the name. Second Lieutenant still. Barnes, Probst, Bogacki, Markus, Ernest, Titus, Brown — the same crew, the same order.",
    credit: "Family collection",
    kind: "object",
    maxWidth: "lg",
  },
};

export const photoList: ArchivePhoto[] = [
  photos.airfield,
  photos.richard,
  photos.beatie,
  photos.crew,
  photos.crew2,
  photos.naming,
  photos.nose,
  photos.brown,
  photos.barnes,
  photos.bogacki,
  photos.titus,
  photos.pair,
  photos.brothers,
  photos.joyce,
  photos.jimmy,
  photos.jimmy1,
  photos.idcard,
  photos.london,
  photos.redbar,
  photos.gazette,
  photos.watts,
  photos.hamburg,
  photos.shop,
  photos.biro,
  photos.promotion,
  photos.merit,
  photos.greenville,
  photos.instrument,
  photos.quals,
  photos.birth,
  photos.will,
  photos.wallet,
  photos.snorter,
  photos.ticket,
  photos.jacket,
  photos.patch,
  photos.form5,
  photos.letter,
  photos.go289,
  photos.stuart,
  photos.rating,
  photos.medical,
  photos.chart7,
];

export const photographs = photoList.filter((p) => p.kind === "photograph");
export const objects = photoList.filter((p) => p.kind === "object");

export function isPhotoId(id: string): id is PhotoId {
  return Object.prototype.hasOwnProperty.call(photos, id);
}


export function displayCredit(credit: string) {
  return credit.replace(/\b([a-z])/g, (ch) => ch.toUpperCase());
}

export function citePhoto(photo: ArchivePhoto) {
  const url = `https://spiritofmartinez.com/archive/${photo.id}`;
  const dated = photo.date ? `, ${photo.date}` : "";
  return {
    credit: displayCredit(photo.credit),
    title: photo.title,
    dated,
    work: "The Spirit of Martinez",
    url,
  };
}

export function adjacentPhotos(id: PhotoId) {
  const i = photoList.findIndex((p) => p.id === id);
  return {
    prev: i > 0 ? photoList[i - 1] : undefined,
    next: i >= 0 && i < photoList.length - 1 ? photoList[i + 1] : undefined,
    index: i,
    total: photoList.length,
  };
}
