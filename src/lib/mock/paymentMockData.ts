import type { PaymentGateway, PaymentKind, PaymentStatus } from "@/types/payment";

const PAYMENTS_KEY = "pb_payments";

function readPayments(): import("@/types/payment").Payment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    return raw ? (JSON.parse(raw) as import("@/types/payment").Payment[]) : [];
  } catch {
    return [];
  }
}

function writePayments(payments: import("@/types/payment").Payment[]): void {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function getMockPayments(userId?: string): import("@/types/payment").Payment[] {
  const all = readPayments();
  if (!userId) return all;
  return all.filter((p) => p.userId === userId);
}

export function recordMockPayment(input: {
  userId: string;
  kind: PaymentKind;
  refId?: string | null;
  amount: number;
  status?: PaymentStatus;
  gateway?: PaymentGateway;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  currency?: string;
}): import("@/types/payment").Payment {
  const payment: import("@/types/payment").Payment = {
    id: crypto.randomUUID(),
    userId: input.userId,
    kind: input.kind,
    refId: input.refId ?? null,
    amount: input.amount,
    currency: input.currency ?? "INR",
    status: input.status ?? "pending",
    gateway: input.gateway ?? "placeholder",
    gatewayOrderId: input.gatewayOrderId ?? null,
    gatewayPaymentId: input.gatewayPaymentId ?? null,
    createdAt: new Date().toISOString(),
  };

  const all = readPayments();
  all.unshift(payment);
  writePayments(all);
  return payment;
}

const FEATURED_KEY = "pb_organizer_featured";
const BOOST_KEY = "pb_profile_boost";

function readFeaturedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FEATURED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeFeaturedIds(ids: Set<string>): void {
  localStorage.setItem(FEATURED_KEY, JSON.stringify([...ids]));
}

export function getOrganizerFeaturedIds(): Set<string> {
  return readFeaturedIds();
}

export function toggleOrganizerFeatured(tournamentId: string): void {
  const ids = readFeaturedIds();
  if (ids.has(tournamentId)) ids.delete(tournamentId);
  else ids.add(tournamentId);
  writeFeaturedIds(ids);
}

function readBoostedUserIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(BOOST_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeBoostedUserIds(ids: Set<string>): void {
  localStorage.setItem(BOOST_KEY, JSON.stringify([...ids]));
}

export function isProfileBoosted(userId: string): boolean {
  return readBoostedUserIds().has(userId);
}

export function setProfileBoosted(userId: string, boosted: boolean): void {
  const ids = readBoostedUserIds();
  if (boosted) ids.add(userId);
  else ids.delete(userId);
  writeBoostedUserIds(ids);
}
