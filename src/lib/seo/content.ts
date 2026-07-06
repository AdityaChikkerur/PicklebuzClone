import type { FaqItem } from "./jsonLd";

export interface FeatureBlock {
  title: string;
  description: string;
  icon: string;
}

export const CORE_FEATURES: FeatureBlock[] = [
  {
    title: "Live Match Scoring",
    description:
      "Score rally-by-rally with side-out rules, faults, timeouts, and game/match logic — just like a pro tournament desk.",
    icon: "🏓",
  },
  {
    title: "Live Spectator Boards",
    description:
      "Share a spectate link so friends, fans, and club members follow every point in real time from any device.",
    icon: "📺",
  },
  {
    title: "Tournaments & Fixtures",
    description:
      "Create brackets, manage registrations, collect fees via Razorpay, and publish points tables automatically.",
    icon: "🏆",
  },
  {
    title: "Player Rankings",
    description:
      "Strength-weighted leaderboards, win streaks, head-to-head stats, and BUZZ ratings to track your true level.",
    icon: "📊",
  },
  {
    title: "Club Discovery & Booking",
    description:
      "Find pickleball clubs across India, view court availability, and book slots without WhatsApp chaos.",
    icon: "📍",
  },
  {
    title: "Organizer & Referee Tools",
    description:
      "Dedicated dashboards for tournament directors, club owners, and referees with dispute resolution built in.",
    icon: "⚖️",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is PickleBuzz?",
    answer:
      "PickleBuzz is India's mobile-first pickleball platform for live scoring, tournaments, club bookings, player rankings, and community discovery — built for recreational and competitive players alike.",
  },
  {
    question: "Is PickleBuzz free to use?",
    answer:
      "Yes. PickleBuzz is free for players to score matches, follow live games, and track stats. Organizers may charge tournament entry fees through integrated Razorpay payments.",
  },
  {
    question: "Can I live score pickleball matches on my phone?",
    answer:
      "Absolutely. PickleBuzz is designed for courtside scoring on mobile — tap faults, track serve side, manage timeouts, and broadcast scores instantly to spectators.",
  },
  {
    question: "What is the BUZZ rating?",
    answer:
      "BUZZ is PickleBuzz's own skill rating, calculated from your verified match results on the platform — like CricHeroes ratings for cricket.",
  },
  {
    question: "How do pickleball tournaments work on PickleBuzz?",
    answer:
      "Organizers create events, open registration, generate fixtures or brackets, assign referees, and publish live standings — all from one dashboard.",
  },
  {
    question: "Can clubs manage court bookings on PickleBuzz?",
    answer:
      "Club owners get a dedicated dashboard to list courts, manage availability, and accept bookings from players in their city.",
  },
  {
    question: "Is PickleBuzz available in my city?",
    answer:
      "PickleBuzz is growing across India — Mumbai, Thane, Navi Mumbai, Bengaluru, Delhi NCR, Hyderabad, Pune, Chennai, Nashik, Nagpur, Kolkata, Indore, Jaipur, Lucknow, and more. Browse clubs on the app or visit our city pages.",
  },
  {
    question: "How is PickleBuzz different from CricHeroes?",
    answer:
      "CricHeroes revolutionized grassroots cricket scoring in India. PickleBuzz brings the same live-scoring, tournament, and community network experience to India's fast-growing pickleball scene.",
  },
];

export interface CityPageContent {
  slug: string;
  path: string;
  city: string;
  headline: string;
  intro: string;
  highlights: string[];
  keywords: string[];
}

export const CITY_PAGES: CityPageContent[] = [
  {
    slug: "mumbai",
    path: "/pickleball-in-mumbai",
    city: "Mumbai",
    headline: "Pickleball in Mumbai — Live Scores, Clubs & Tournaments",
    intro:
      "Mumbai's pickleball scene spans Bandra, Andheri, Colaba, Lower Parel, Chembur, Goregaon, Powai, Juhu, and beyond. PickleBuzz lists 63 verified dedicated pickleball courts across Mumbai city — from Smash Dock and BandrArcade at Taj Lands End to Picklehaus Mulund and Pickle Partners at Sahara Star.",
    highlights: [
      "Browse verified pickleball courts across Bandra, Andheri, Powai, and South Mumbai",
      "Live score league nights at Smash Dock, Score Pickleball, and Maniac arenas",
      "Discover premium venues like BandrArcade, Picklehaus Mulund, and Torba Juhu",
    ],
    keywords: [
      "pickleball Mumbai",
      "pickleball clubs Mumbai",
      "pickleball courts Mumbai",
      "pickleball scoring app Mumbai",
    ],
  },
  {
    slug: "bengaluru",
    path: "/pickleball-in-bengaluru",
    city: "Bengaluru",
    headline: "Pickleball in Bengaluru — India's Tech-Forward Pickleball Hub",
    intro:
      "Bengaluru is India's pickleball hub — from Bellandur and Indiranagar to Chamrajpet and Vasanth Nagar. PickleBuzz lists 5 verified top-rated courts including PaddleX, Game Theory, PykIn Sports, The Pickl Club, and Millers Pickleball.",
    highlights: [
      "Browse premium courts at PaddleX and The Pickl Club",
      "Live score league nights at Game Theory and PykIn Sports",
      "Discover Indiranagar, Bellandur, and central Bengaluru venues",
    ],
    keywords: [
      "pickleball Bengaluru",
      "pickleball Bangalore",
      "pickleball app Bangalore",
    ],
  },
  {
    slug: "delhi-ncr",
    path: "/pickleball-in-delhi-ncr",
    city: "Delhi NCR",
    headline: "Pickleball in Delhi NCR — Noida, Gurgaon & Beyond",
    intro:
      "Delhi NCR's pickleball scene spans South Delhi, Mayapuri, and Ladha Sarai. PickleBuzz lists 4 verified flagship courts — REPPP, RallyGully, The DinkYard, and Dinkit Delhi — for live scoring and court discovery.",
    highlights: [
      "Browse mega complexes like REPPP and The DinkYard",
      "Live score league finals across South Delhi",
      "Discover rooftop and indoor courts near metro hubs",
    ],
    keywords: [
      "pickleball Delhi",
      "pickleball Noida",
      "pickleball Gurgaon",
    ],
  },
  {
    slug: "hyderabad",
    path: "/pickleball-in-hyderabad",
    city: "Hyderabad",
    headline: "Pickleball in Hyderabad — Score, Compete & Grow",
    intro:
      "Hyderabad's pickleball courts span Jubilee Hills, Secunderabad, Madhapur, and Gachibowli. PickleBuzz lists 4 verified venues — from The Kitchen luxury lounge to Pikklle Arena and Gachibowli Stadium Court.",
    highlights: [
      "Browse HITEC City and Gachibowli pickleball courts",
      "Live score at The Kitchen and Let's Pickle Arena",
      "Discover Secunderabad and Jubilee Hills clubs",
    ],
    keywords: [
      "pickleball Hyderabad",
      "pickleball HITEC City",
      "pickleball app Hyderabad",
    ],
  },
  {
    slug: "pune",
    path: "/pickleball-in-pune",
    city: "Pune",
    headline: "Pickleball in Pune — Community Scoring Made Simple",
    intro:
      "Pune's pickleball scene spans Hinjawadi, Viman Nagar, Aundh, Balewadi, Kothrud, Wagholi, and Punawale. PickleBuzz lists verified dedicated pickleball courts — from Bounzz Pickleden to Pickleball Arena Punawale — for live scoring and court discovery.",
    highlights: [
      "Browse dedicated pickleball courts across Aundh and Viman Nagar",
      "Live score league and friendly matches",
      "Discover arenas in Balewadi, Kothrud, Wagholi, and Punawale",
    ],
    keywords: [
      "pickleball Pune",
      "pickleball clubs Pune",
      "pickleball scoring Pune",
    ],
  },
  {
    slug: "chennai",
    path: "/pickleball-in-chennai",
    city: "Chennai",
    headline: "Pickleball in Chennai — Live Scores for Tamil Nadu's Fastest-Growing Sport",
    intro:
      "Chennai's pickleball adoption spans Velachery, ECR, OMR, and Kottivakkam. PickleBuzz lists 4 verified courts — Pickleball Paradise by FC Marina, Paddle Lounge, The Colosseum, and Leap Sports Academy 2.0.",
    highlights: [
      "Browse coastal and OMR pickleball destinations",
      "Live score at FC Marina and Paddle Lounge",
      "Discover ECR and Velachery flagship venues",
    ],
    keywords: [
      "pickleball Chennai",
      "pickleball Tamil Nadu",
      "pickleball app Chennai",
    ],
  },
  {
    slug: "nashik",
    path: "/pickleball-in-nashik",
    city: "Nashik",
    headline: "Pickleball in Nashik — Courts, Clubs & Live Scoring",
    intro:
      "Nashik's pickleball scene spans Makhmalabad, Chandshi, Vilholi, and Savarkar Nagar. PickleBuzz lists real local clubs — from Nandanwan Lawn to Big Bounce Sports Arena — so you can find courts and score matches live.",
    highlights: [
      "Browse Nashik pickleball clubs and court hours",
      "Live score friendly matches and league nights",
      "Discover venues in Chandshi, Makhmalabad, and beyond",
    ],
    keywords: [
      "pickleball Nashik",
      "pickleball clubs Nashik",
      "pickleball courts Nashik",
    ],
  },
  {
    slug: "nagpur",
    path: "/pickleball-in-nagpur",
    city: "Nagpur",
    headline: "Pickleball in Nagpur — Clubs, Courts & Grand Slam League",
    intro:
      "Nagpur's pickleball community is growing fast across Dharampeth, Jaripatka, Wardhaman Nagar, and Pardi. PickleBuzz lists verified local clubs — from Pickle Co to Pickle Social Club — and covers the Nagpur Grand Slam franchise league.",
    highlights: [
      "Browse Nagpur pickleball clubs with court hours",
      "Follow the Nagpur Grand Slam Pickleball League",
      "Live score matches at Pickle Co, The Cage, and more",
    ],
    keywords: [
      "pickleball Nagpur",
      "pickleball clubs Nagpur",
      "Nagpur Grand Slam pickleball",
    ],
  },
  {
    slug: "thane",
    path: "/pickleball-in-thane",
    city: "Thane",
    headline: "Pickleball in Thane — Courts, Clubs & Live Scoring",
    intro:
      "Thane's pickleball scene covers Ghodbunder Road, Majiwada, Balkum, and Upvan. PickleBuzz lists 7 verified dedicated pickleball courts — from House of Pickle (HOP) and Pickledeck Thane to Mark10 Pickleball Academy and The Thane Club.",
    highlights: [
      "Browse verified pickleball courts across Thane West and Thane East",
      "Live score league nights at HOP, Pickledeck, and Mark10 Academy",
      "Discover multi-sport venues at Urban Sports Rustomjee and Zion Performance Court",
    ],
    keywords: [
      "pickleball Thane",
      "pickleball clubs Thane",
      "pickleball courts Thane",
    ],
  },
  {
    slug: "navi-mumbai",
    path: "/pickleball-in-navi-mumbai",
    city: "Navi Mumbai",
    headline: "Pickleball in Navi Mumbai — Courts, Clubs & Live Scoring",
    intro:
      "Navi Mumbai's pickleball community spans Nerul, Kharghar, Panvel, Juinagar, and Ulwe. PickleBuzz lists 7 verified dedicated pickleball courts — from MatchPoint Pickleball Club and Nerul Gymkhana to PicklePro Club at Raheja District and CAP Club at Karnala Sports.",
    highlights: [
      "Browse verified pickleball courts across Nerul, Kharghar, and New Panvel",
      "Live score friendly matches at school arenas and gymkhana clubs",
      "Discover PicklePlay venues in Kharghar and Sanpada after school hours",
    ],
    keywords: [
      "pickleball Navi Mumbai",
      "pickleball clubs Navi Mumbai",
      "pickleball courts Navi Mumbai",
    ],
  },
  {
    slug: "kolkata",
    path: "/pickleball-in-kolkata",
    city: "Kolkata",
    headline: "Pickleball in Kolkata — Courts, Clubs & Live Scoring",
    intro:
      "Kolkata's pickleball scene spans Newtown, Park Street, and Salt Lake Sector V. PickleBuzz lists 3 verified courts — Playplex Sports Arena, The Pickle Court, and Pickleball XL.",
    highlights: [
      "Browse rooftop courts at Axis Mall Newtown",
      "Live score 24/7 at The Pickle Court off Park Street",
      "Discover Salt Lake tech corridor venues",
    ],
    keywords: [
      "pickleball Kolkata",
      "pickleball clubs Kolkata",
      "pickleball courts Kolkata",
    ],
  },
  {
    slug: "indore",
    path: "/pickleball-in-indore",
    city: "Indore",
    headline: "Pickleball in Indore — Courts, Clubs & Live Scoring",
    intro:
      "Indore's pickleball community is growing across Silicon City, Apollo DB City, and Rajendra Nagar. PickleBuzz lists 3 verified courts — Optimus Pickleball Club & Cafe, Elite Pickleball Club, and Pickle Paradise.",
    highlights: [
      "Browse lifestyle courts at Optimus and Pickle Paradise",
      "Live score league and friendly matches",
      "Discover pro training grounds at Elite Pickleball Club",
    ],
    keywords: [
      "pickleball Indore",
      "pickleball clubs Indore",
      "pickleball courts Indore",
    ],
  },
  {
    slug: "jaipur",
    path: "/pickleball-in-jaipur",
    city: "Jaipur",
    headline: "Pickleball in Jaipur — Courts, Clubs & Live Scoring",
    intro:
      "Jaipur's pickleball scene covers Mansarovar and Sirsi Road. PickleBuzz lists 2 verified courts — The Dink District near Mansarovar Metro and Jaipur Racket Academy.",
    highlights: [
      "Browse tournament headliner venues at The Dink District",
      "Live score at Jaipur Racket Academy",
      "Discover Mansarovar and Kanakpura corridor courts",
    ],
    keywords: [
      "pickleball Jaipur",
      "pickleball clubs Jaipur",
      "pickleball courts Jaipur",
    ],
  },
  {
    slug: "lucknow",
    path: "/pickleball-in-lucknow",
    city: "Lucknow",
    headline: "Pickleball in Lucknow — Courts, Clubs & Live Scoring",
    intro:
      "Lucknow's pickleball hubs span Gomti Nagar and Hazratganj. PickleBuzz lists 3 verified courts — Athletes Pickle Court, Picklepro Arena, and Pickleball by Play Padel at Hotel Clarks Avadh.",
    highlights: [
      "Browse premium Gomti Nagar pickleball arenas",
      "Live score at Athletes Pickle Court and Picklepro Arena",
      "Discover luxury resort courts in Hazratganj",
    ],
    keywords: [
      "pickleball Lucknow",
      "pickleball clubs Lucknow",
      "pickleball courts Lucknow",
    ],
  },
];

export function getCityPageBySlug(slug: string): CityPageContent | undefined {
  return CITY_PAGES.find((page) => page.slug === slug);
}
