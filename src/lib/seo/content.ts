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
      "PickleBuzz is growing across India — Mumbai, Bengaluru, Delhi NCR, Hyderabad, Pune, Chennai, and more. Browse clubs on the app or visit our city pages.",
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
      "Mumbai's pickleball scene is booming. PickleBuzz helps players in Bandra, Andheri, Powai, and across the city score matches live, find clubs, and join local tournaments.",
    highlights: [
      "Discover Mumbai pickleball clubs and courts",
      "Live score weekend ladder matches and league nights",
      "Register for Mumbai open tournaments in seconds",
    ],
    keywords: [
      "pickleball Mumbai",
      "pickleball clubs Mumbai",
      "pickleball scoring app Mumbai",
    ],
  },
  {
    slug: "bengaluru",
    path: "/pickleball-in-bengaluru",
    city: "Bengaluru",
    headline: "Pickleball in Bengaluru — India's Tech-Forward Pickleball Hub",
    intro:
      "From Koramangala to Whitefield, Bengaluru players use PickleBuzz for live scoring, BUZZ-tracked rankings, and seamless tournament registration.",
    highlights: [
      "Find Bengaluru clubs with real-time court availability",
      "Track stats and climb city leaderboards",
      "Organize corporate pickleball leagues with fixtures",
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
      "Delhi NCR's pickleball community spans Noida, Gurgaon, and South Delhi. PickleBuzz connects players, clubs, and organizers across the capital region.",
    highlights: [
      "Cross-NCR club discovery and court booking",
      "Live spectator links for league finals",
      "Tournament management for academies and sports complexes",
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
      "Hyderabad's pickleball courts are filling up fast. PickleBuzz gives HITEC City and Gachibowli players the tools to score live and compete in ranked events.",
    highlights: [
      "Hyderabad club listings with booking support",
      "Player discovery and follow network",
      "Weekend tournament brackets with live standings",
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
      "Pune's recreational and competitive pickleball players rely on PickleBuzz for match history, live scores, and local tournament discovery.",
    highlights: [
      "Pune club and court finder",
      "Match verification and dispute resolution",
      "Strength-weighted city rankings",
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
      "Chennai's pickleball adoption is accelerating. PickleBuzz helps players score matches courtside and share live results with spectators instantly.",
    highlights: [
      "Chennai club discovery",
      "Live scoring for doubles and singles",
      "Tournament registration with Razorpay",
    ],
    keywords: [
      "pickleball Chennai",
      "pickleball Tamil Nadu",
      "pickleball app Chennai",
    ],
  },
];

export function getCityPageBySlug(slug: string): CityPageContent | undefined {
  return CITY_PAGES.find((page) => page.slug === slug);
}
