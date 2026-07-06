import type { MatchCategory } from "@/types/match";
import type { Player } from "@/types/player";
import { avatarUrl } from "@/lib/utils";

export const MATCH_CATEGORIES: { value: MatchCategory; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "league", label: "League" },
  { value: "tournament", label: "Tournament" },
  { value: "practice", label: "Practice" },
];

export const QUICK_VENUES = [
  { name: "Pickle Social Club", city: "Nagpur" },
  { name: "Pickle Co", city: "Nagpur" },
  { name: "The Pickle Park", city: "Nagpur" },
  { name: "Nandanwan Lawn", city: "Nashik" },
  { name: "The Nova Club", city: "Nashik" },
  { name: "Nashik Sports Klub", city: "Nashik" },
  { name: "Pickleball Paradise", city: "Nashik" },
  { name: "The Spinshot", city: "Nashik" },
  { name: "Smash Arena", city: "Bengaluru" },
  { name: "Pickle Park", city: "Mumbai" },
  { name: "Court Central", city: "Mumbai" },
  { name: "Dink Dynasty", city: "Delhi" },
];

export const MOCK_SEARCH_PLAYERS: Player[] = [
  {
    id: "p1",
    fullName: "Priya Sharma",
    avatarUrl: avatarUrl("priya-sharma"),
    city: "Bengaluru",
    skillLevel: "4.0",
    duprRating: 4.05,
  },
  {
    id: "p2",
    fullName: "Rohan Desai",
    avatarUrl: avatarUrl("rohan-desai"),
    city: "Bengaluru",
    skillLevel: "3.5",
    duprRating: 3.72,
  },
  {
    id: "p3",
    fullName: "Ananya Iyer",
    avatarUrl: avatarUrl("ananya-iyer"),
    city: "Bengaluru",
    skillLevel: "4.5",
    duprRating: 4.38,
  },
  {
    id: "p4",
    fullName: "Vikram Patel",
    avatarUrl: avatarUrl("vikram-patel"),
    city: "Mumbai",
    skillLevel: "3.5",
    duprRating: 3.65,
  },
  {
    id: "p5",
    fullName: "Sneha Reddy",
    avatarUrl: avatarUrl("sneha-reddy"),
    city: "Hyderabad",
    skillLevel: "4.0",
    duprRating: 4.12,
  },
  {
    id: "p6",
    fullName: "Arjun Mehta",
    avatarUrl: avatarUrl("arjun-mehta"),
    city: "Bengaluru",
    skillLevel: "4.0",
    duprRating: 4.12,
  },
  {
    id: "p7",
    fullName: "Kavya Nair",
    avatarUrl: avatarUrl("kavya-nair"),
    city: "Chennai",
    skillLevel: "3.0",
    duprRating: 3.28,
  },
  {
    id: "p8",
    fullName: "Dev Malhotra",
    avatarUrl: avatarUrl("dev-malhotra"),
    city: "Delhi",
    skillLevel: "4.5",
    duprRating: 4.52,
  },
  {
    id: "p9",
    fullName: "Meera Joshi",
    avatarUrl: avatarUrl("meera-joshi"),
    city: "Pune",
    skillLevel: "3.5",
    duprRating: 3.58,
  },
  {
    id: "p10",
    fullName: "Karan Singh",
    avatarUrl: avatarUrl("karan-singh"),
    city: "Mumbai",
    skillLevel: "5.0+",
    duprRating: 4.65,
  },
  {
    id: "p11",
    fullName: "Isha Gupta",
    avatarUrl: avatarUrl("isha-gupta"),
    city: "Delhi",
    skillLevel: "3.0",
    duprRating: 3.15,
  },
  {
    id: "p12",
    fullName: "Nikhil Rao",
    avatarUrl: avatarUrl("nikhil-rao"),
    city: "Hyderabad",
    skillLevel: "4.0",
    duprRating: 3.95,
  },
];
