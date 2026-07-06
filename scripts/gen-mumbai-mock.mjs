import { writeFileSync } from "fs";

const venues = [
  ["NextWave Pickleball", "Girls Education Society, IIDE Campus, Swami Vivekanand Rd, near Andheri Station, Mumbai", null, 4.9, "06:00", "23:59", ["pickleball court", "coaching"]],
  ["Score Pickleball", "Score Pickleball, Marwah Industrial Estate, 106, Krishanlal Marwah Marg, Andheri East, Mumbai", "+91 98207 99704", 4.8, "00:00", "23:59", ["pickleball court", "24 hours"]],
  ["RC Pickleball Court", "Institute, Central Railway, Sir Jamshedji Jeejeebhoy Rd, near Hume High School, Mumbai", "+91 93261 58881", 4.6, "00:00", "23:59", ["sports complex", "pickleball court"]],
  ["Iron Pickleball", "1st floor, Richa Realtors, Gokhale Rd, above Axis Bank, Dadar, Mumbai", null, 5.0, "00:00", "23:59", ["pickleball court", "24 hours"]],
  ["MANIAC PICKLEBALL ARENA | VILE PARLE (W)", "I-ONE terrace, 56, near Golden Tobacco Company, behind 360 Studios, Vile Parle West, Mumbai", "+91 79770 01211", 4.7, "06:00", "23:59", ["pickleball court", "coaching"]],
  ["Sarvashreshtha Annabhau Sathe Indoor Court", "Annabhau Sathe Krida Sankul, 247 Motilal Nagar No.1, New Link Rd, Goregaon, Mumbai", "+91 98925 63770", 4.7, "06:00", "23:59", ["pickleball court", "indoor courts"]],
  ["Global Sports Pickleball (Juhu)", "NSM School, Kankuwadi, Vile Parle East / Juhu, Mumbai", "+91 88283 39146", 4.1, "06:00", "23:00", ["sports club", "pickleball court"]],
  ["CS Pickleball Academy", "Joshi Building, terrace of Corkage Restaurant, Saki Vihar Rd, Andheri East, Mumbai", null, 4.9, "06:00", "23:00", ["pickleball court", "coaching"]],
  ["PlayOSport Pickleball court", "63, Tardeo Rd, above SBI bank, Arya Nagar, Tulsiwadi, Mumbai", "+91 87670 56521", 4.9, "06:00", "23:00", ["pickleball court"]],
  ["The Courtroom | Chembur - Padel & Pickle", "Plot No. 341, opp. Tukaram Mandir, Chembur, Mumbai", "+91 83695 34929", 5.0, "06:00", "23:59", ["sports club", "pickleball court", "padel"]],
  ["Global Sports Pickleball (Lower Parel)", "Peninsula Corporate Park, Ganapatrao Kadam Marg, Lower Parel, Mumbai", null, 4.8, "06:00", "23:59", ["pickleball court"]],
  ["Pro World Talent Pickleball Academy", "Near Link Road, Andheri West, Mumbai", "+91 70210 09826", 5.0, "00:00", "23:59", ["sports club", "pickleball academy", "24 hours"]],
  ["Maniac x Picklepro Pickleball Arena", "Hill Rd, inside Apostolic Carmel High School, Bandra West, Mumbai", null, 4.6, "06:00", "22:30", ["pickleball court"]],
  ["JFSC - Fatima Pickleball Arena (Indoor AC)", "3rd Floor, Fatima High School, Kirol Rd, opposite Jolly Gymkhana, Vidyavihar, Mumbai", null, 5.0, "18:00", "23:00", ["pickleball court", "indoor courts", "AC"]],
  ["Global Sports Pickleball Center Sion", "2VR8+47J, Road Number 29 East, Sion, Mumbai", null, 4.8, "06:00", "23:00", ["pickleball court"]],
  ["Goodland Pickleball", "Country club, Veera Desai Rd, opp. Kia Park building, Andheri West, Mumbai", "+91 98923 15821", 4.1, "06:00", "23:00", ["sports club", "pickleball court"]],
  ["Smash Dock", "Sassoon Dock, B/13, Azad Nagar, Colaba, Mumbai", null, 5.0, "06:00", "23:59", ["pickleball court"]],
  ["DSF Pickleball Court", "CS Rd, Dahisar, Mumbai (Managed by SportLight India)", null, 4.8, "06:00", "17:00", ["sports club", "pickleball court"]],
  ["Aspire Pickleball", "30, Manuel Gonsalves Rd, Bandra West, Mumbai", null, 4.6, "06:00", "22:00", ["pickleball court"]],
  ["Goalster Pickleball - Carter Road", "Next to clubhouse, Pali Hill, Carter Rd, Bandra West, Mumbai", "+91 70218 40279", 4.7, "06:00", "23:00", ["sports complex", "pickleball court"]],
  ["Bombay Pickleball Club", "1/B, Lamington Rd, Grant Road, Mumbai", "+91 91364 01921", 5.0, "06:00", "18:00", ["pickleball club", "equipment"]],
  ["Runway Pickleball (Pranik Sportz)", "Sakinaka Tele Exchange Ln, Andheri Kurla Road, Andheri East, Mumbai", "+91 98672 48351", 4.7, "17:00", "23:59", ["sports club", "pickleball court"]],
  ["Sarvashreshtha Happy Games Centre", "4th floor, Jawahar Nagar CHS, above Jawahar Nagar Hall, Goregaon West, Mumbai", null, 5.0, "06:00", "23:00", ["community center", "pickleball court"]],
  ["PicklePro Club ProTurf Lower Parel", "Raghuvanshi Mills, Terrace, Forum House, Lower Parel, Mumbai", null, 4.5, "06:00", "23:59", ["pickleball court"]],
  ["Pickleball courts by TSG Global Sports Arena", "JP Rd, Botanical Garden, Andheri West, Mumbai", "+91 91371 32588", 3.8, "00:00", "23:59", ["sports complex", "pickleball court", "24 hours"]],
  ["Maniac Basketball & Pickleball Arena", "Lotus petrol pump lane, near Infiniti Mall, Oshiwara, Mumbai", "+91 93261 01388", 4.5, "06:00", "23:00", ["sports complex", "pickleball court"]],
  ["PaddleWhizz Pickleball Academy", "Mota Nagar, Parking Galli, Room 22, Nityapriya CHS Ltd, Andheri East, Mumbai", null, 4.8, "06:00", "22:00", ["pickleball academy", "coaching"]],
  ["Manohar Joshi College Pickleball Court", "Ground, H Block, Sir M Joshi College, Dharavi Depot Rd, Sion, Mumbai", "+91 84529 70066", 4.5, "00:00", "23:59", ["pickleball court", "24 hours"]],
  ["Playflex Pickleball court - Bhandup", "Anand Nagar Barkha Housing Society, Bhandup Village Rd, Bhandup West, Mumbai", "+91 88502 76180", 4.2, "00:00", "23:59", ["pickleball court", "24 hours"]],
  ["The CourtRoom | Odeon - Pickle and Padel", "7th Floor, Odeon Mall, Ghatkopar East, Mumbai", "+91 88501 26259", 5.0, "06:00", "23:59", ["padel club", "pickleball court"]],
  ["Infinity Sports", "Holy Cross Church, Senapati Bapat Marg, Lower Parel, Mumbai", "+91 88790 83053", 4.6, "18:30", "23:00", ["pickleball court"]],
  ["MAKS PICKLEBALL ACADEMY", "ISF Turf, Poonam Garden Road, Mira Road East, Mumbai", "+91 94296 94401", 4.8, "06:00", "23:59", ["pickleball academy", "coaching"]],
  ["PickleBall court", "505, Manuel Gonsalves Rd, Bandra West, Mumbai", null, 5.0, "17:00", "23:00", ["pickleball court"]],
  ["AMP Pickleball Arena @Esplanade College", "Esplanade College Campus, Kalbadevi / Fort, Mumbai", null, 4.3, "18:00", "23:00", ["pickleball court"]],
  ["Global Sports The Pickleball Company", "Junction of 15th Road & 33rd Rd, off Pali Hill, Khar/Bandra West, Mumbai", null, 5.0, "06:00", "23:00", ["pickleball court"]],
  ["The Nirvana Pickleball Club", "Terrace Floor, Raj Shopping Arcade, Haji Zakeria Rd, Malad West, Mumbai", null, 4.5, "06:00", "23:59", ["sports club", "pickleball court"]],
  ["NSCI PadelPark & Pickleball", "Lala Lajpatrai Marg, beside National Sports Club of India, Worli, Mumbai", "+91 99200 77258", 4.9, "06:00", "23:00", ["padel club", "pickleball court"]],
  ["Ocean's Edge Pickleball Club", "WRMG+R29, A Rd, Churchgate, Mumbai", null, 4.3, "06:00", "22:00", ["sports club", "pickleball court"]],
  ["Global Sports Pickleball (Stellar World)", "Stellar World School, Off New Link Rd, Andheri West, Mumbai", null, 3.5, "06:00", "22:00", ["pickleball court"]],
  ["Astro Park Pickleball", "St. Stanislaus Sports Complex, Bandra West, Mumbai", null, 4.5, "16:30", "22:00", ["sports complex", "pickleball court"]],
  ["Neon Pickleball", "Chedda Nagar Gymkhana, Chembur, Mumbai", "+91 22 2525 0636", 4.2, "00:00", "23:59", ["pickleball arena", "24 hours"]],
  ["PicklePro Club - Breach Candy", "Breach Candy, Upscale Enclave, South Mumbai", null, 4.8, "07:00", "23:00", ["pickleball court"]],
  ["PicklePro Club - Peddar Road", "Central Peddar Road Boutique Arena, Mumbai", null, 4.7, "07:00", "22:00", ["pickleball court"]],
  ["The Racket Club @ The Club", "The Club Mumbai, Cosmopolitan Circle, Andheri West, Mumbai", null, 4.9, "07:00", "21:30", ["country club", "pickleball court"]],
  ["TurfStation Chitrakoot", "Chitrakoot Grounds, behind Citi Mall, Andheri West, Mumbai", null, 4.6, "06:00", "23:59", ["multi-sport arena", "pickleball court"]],
  ["Global Pickle - Kurla", "Kohinoor City Road, Kurla West, Mumbai", null, 5.0, "06:00", "23:00", ["indoor courts", "pickleball court"]],
  ["Java Pickle - Vile Parle", "Navpada, Vile Parle East, Mumbai", null, 4.5, "06:00", "23:00", ["pickleball court"]],
  ["Lad Wadi Pickle Ball", "V P Road, Off C P Tank Circle, Charni Road, Mumbai - 400004", null, 3.8, "06:00", "22:00", ["pickleball court"]],
  ["Willingdon Outdoor Sports Arena", "K K Marg, Haji Ali, Malviya Nagar, Mahalakshmi, Mumbai - 400034", null, 4.6, "06:00", "22:00", ["sports club", "pickleball court"]],
  ["Pickle Partners | Sahara Star", "Hotel Sahara Star Terrace, Opp Domestic Airport, Vile Parle East, Mumbai - 400099", null, 5.0, "06:00", "23:00", ["pickleball court"]],
  ["Urban Sports Padel and Pickleball - Saki Vihar", "Saki Vihar Road, Muranjan Wadi, Paspoli, Andheri East, Mumbai - 400072", null, 4.5, "06:00", "23:59", ["padel", "pickleball court"]],
  ["Players Pickleball Courts Shere Punjab", "Shere Punjab Gymkhana Grounds, Mahakali Caves Rd, Andheri East, Mumbai - 400093", null, 4.8, "06:00", "23:00", ["pickleball court"]],
  ["Blossoms Pickleball", "Marol Maroshi Road, near Seven Hills Hospital, Andheri East, Mumbai - 400059", null, 4.7, "06:00", "23:00", ["pickleball court"]],
  ["Sportzella Turf And Pickleball", "Aaram Society Road, Hind Nagar, Vakola Bridge, Santacruz East, Mumbai - 400055", null, 3.2, "06:00", "23:00", ["multi-sport", "pickleball court"]],
  ["Emma Sports Academy", "Plot No. 103, Triandaz Village, Ayyappa Temple Rd, Hiranandani Complex, Powai, Mumbai - 400076", null, 4.3, "07:00", "23:59", ["sports academy", "pickleball court"]],
  ["Torba Pickleball Centre", "Juhu Gymkhana Grounds, Devle Road, Juhu, Mumbai - 400049", null, 4.5, "06:00", "22:30", ["pickleball court"]],
  ["KTTFA Juhu Millennium Club", "Juhu Millennium Club, 1st Road, Juhu Scheme, Juhu, Mumbai - 400049", null, 4.4, "06:00", "22:00", ["sports club", "pickleball court"]],
  ["BandrArcade - Taj Lands End", "Taj Lands End Terrace, Byramji Jeejeebhoy Road, Bandra West, Mumbai - 400050", null, 4.9, "07:00", "22:00", ["premium court", "pickleball court"]],
  ["District Sports Club", "H Block BKC, Sion-Bandra Link Road, Sion, Mumbai - 400022", null, 4.1, "06:00", "23:00", ["sports club", "pickleball court"]],
  ["Pawar Public School (Chandivali)", "Sangharsh Nagar, Chandivali Farm Road, Andheri East, Mumbai - 400072", null, 4.2, "06:00", "22:00", ["school arena", "pickleball court", "evenings/weekends"]],
  ["The Sports Foundry", "LBS Marg, near Shangrila Resort, Bhandup West, Mumbai - 400078", null, 4.3, "06:00", "23:59", ["sports complex", "pickleball court"]],
  ["Picklehaus Mulund", "Commercial Terrace Enclave, LBS Marg, Mulund West, Mumbai - 400080", null, 5.0, "06:00", "23:30", ["pickleball court"]],
  ["Shri Rajasthan Recreation Club", "Plot 14, Link Road Extension, Malad West, Mumbai - 400064", null, 4.4, "07:00", "23:00", ["recreation club", "pickleball court"]],
];

const json = (v) => JSON.stringify(v);

let out = `import type { Club, Court } from "@/types/club";\n\nexport const MUMBAI_CLUBS: Club[] = [\n`;
for (let i = 0; i < venues.length; i++) {
  const [name, location, contact, rating, openFrom, openTo, amenities] = venues[i];
  const id = `mumbai-club-${i + 1}`;
  out += `  {
    id: ${json(id)},
    ownerId: "club-owner",
    name: ${json(name)},
    city: "Mumbai",
    location: ${json(location)},
    amenities: ${json(amenities)},
    contact: ${json(contact ?? "")},
    rating: ${rating},
    courtCount: 2,
  },\n`;
}
out += `];\n\nexport const MUMBAI_COURTS: Court[] = [\n`;
for (let i = 0; i < venues.length; i++) {
  const [, , , , openFrom, openTo] = venues[i];
  const id = `mumbai-club-${i + 1}`;
  out += `  { id: "court-m${i + 1}-1", clubId: ${json(id)}, name: "Court 1", surface: "acrylic hard", pricePerHour: 0, openFrom: ${json(openFrom)}, openTo: ${json(openTo)} },\n`;
  out += `  { id: "court-m${i + 1}-2", clubId: ${json(id)}, name: "Court 2", surface: "acrylic hard", pricePerHour: 0, openFrom: ${json(openFrom)}, openTo: ${json(openTo)} },\n`;
}
out += `];\n`;

writeFileSync("src/lib/mock/mumbaiMockData.ts", out);
console.log(`Generated ${venues.length} Mumbai clubs`);
