import { writeFileSync } from "fs";

const thaneVenues = [
  ["House of Pickle (HOP)", "B-Wing, 2nd floor, Terrace, Dev Corpora, Cadbury Junction, Eastern Express Highway, Thane West - 400601", "+91 95943 25361", 4.3, "00:00", "23:59", ["premium pickleball club", "pickleball court", "24 hours"]],
  ["The Thane Club Pickleball", "Teen Haath Naka, Opp. Raheja Garden, Thane West - 400601", "+91 22 4155 5400", 4.5, "06:00", "23:00", ["sports club", "pickleball court"]],
  ["Zion Performance Court", "Swatantraveer Sawarkar Taran Talav, Chendani Bunder Road, Thane East - 400603", null, 4.5, "06:00", "23:00", ["pickleball arena", "pickleball court"]],
  ["Mark10 Pickleball Academy", "Dhokali - Balkum Rd, near Pride Horizon, Thane West - 400608", null, 4.9, "06:00", "23:00", ["pickleball academy", "coaching"]],
  ["Pickledeck Thane", "Terrace Area, Near Ghodbunder Road, Thane West - 400607", null, 5.0, "06:00", "23:59", ["pickleball court"]],
  ["Pickleball Villa (Sorted Place)", "Yeoor Hills, Upvan, Thane West - 400606", null, 2.8, "00:00", "23:59", ["pickleball court", "24 hours"]],
  ["Urban Sports Rustomjee", "Rustomjee Urbania, Majiwada, Thane West - 400601", null, 4.2, "06:00", "23:00", ["multi-sport complex", "pickleball court"]],
];

const naviMumbaiVenues = [
  ["Nerul Gymkhana Pickleball", "Sector 28, Near Sector 12, Nerul, Navi Mumbai - 400706", "+91 93727 70136", 4.5, "07:00", "20:00", ["gymkhana", "pickleball court"]],
  ["PicklePro Club (Raheja District)", "Raheja District II, Juinagar, Navi Mumbai - 400705", null, 3.7, "06:00", "23:00", ["pickleball court"]],
  ["PicklePlay Arena (Vibgyor)", "Vibgyor High School Campus, Sector 15, Kharghar, Navi Mumbai - 410210", null, 4.5, "06:00", "23:00", ["school sports arena", "pickleball court", "after school hours"]],
  ["CAP Club (Karnala Sports)", "Karnala Sports Academy, Sector 7, Cidco Colony, New Panvel, Navi Mumbai - 410206", null, 4.1, "06:00", "23:30", ["sports academy", "pickleball court"]],
  ["PicklePlay Arena (Jaipuriar)", "Jaipuriar School, Sector 10, Sanpada, Navi Mumbai - 400705", null, 4.0, "06:00", "22:00", ["school arena", "pickleball court"]],
  ["MatchPoint Pickleball Club", "Sector 19, New Panvel, Navi Mumbai - 410206", null, 5.0, "06:00", "23:00", ["pickleball court"]],
  ["TSG x Phorce Sports Arena", "CP Goenka International School, Ulwe, Navi Mumbai - 410206", null, null, "06:00", "23:00", ["sports arena", "pickleball court"]],
];

function generate(city, prefix, venues) {
  const clubs = [];
  const courts = [];
  for (let i = 0; i < venues.length; i++) {
    const [name, location, contact, rating, openFrom, openTo, amenities] = venues[i];
    const id = `${prefix}-club-${i + 1}`;
    clubs.push(`  {
    id: ${JSON.stringify(id)},
    ownerId: "club-owner",
    name: ${JSON.stringify(name)},
    city: ${JSON.stringify(city)},
    location: ${JSON.stringify(location)},
    amenities: ${JSON.stringify(amenities)},
    contact: ${JSON.stringify(contact ?? "")},
    rating: ${rating ?? 0},
    courtCount: 2,
  }`);
    courts.push(
      `  { id: "court-${prefix}${i + 1}-1", clubId: ${JSON.stringify(id)}, name: "Court 1", surface: "acrylic hard", pricePerHour: 0, openFrom: ${JSON.stringify(openFrom)}, openTo: ${JSON.stringify(openTo)} }`,
      `  { id: "court-${prefix}${i + 1}-2", clubId: ${JSON.stringify(id)}, name: "Court 2", surface: "acrylic hard", pricePerHour: 0, openFrom: ${JSON.stringify(openFrom)}, openTo: ${JSON.stringify(openTo)} }`
    );
  }
  return { clubs, courts };
}

const thane = generate("Thane", "thane", thaneVenues);
const navi = generate("Navi Mumbai", "navi", naviMumbaiVenues);

const out = `import type { Club, Court } from "@/types/club";

export const THANE_CLUBS: Club[] = [
${thane.clubs.join(",\n")},
];

export const THANE_COURTS: Court[] = [
${thane.courts.join(",\n")},
];

export const NAVI_MUMBAI_CLUBS: Club[] = [
${navi.clubs.join(",\n")},
];

export const NAVI_MUMBAI_COURTS: Court[] = [
${navi.courts.join(",\n")},
];
`;

writeFileSync("src/lib/mock/thaneNaviMumbaiMockData.ts", out);
console.log(`Generated ${thaneVenues.length} Thane + ${naviMumbaiVenues.length} Navi Mumbai clubs`);
