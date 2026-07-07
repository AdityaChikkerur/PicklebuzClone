import type { PaymentGateway, PaymentKind, PaymentStatus } from "@/types/payment";

import {

  FREE_BOOST_DAYS,

  PAID_BOOST_DAYS,

  isAnyBoostActive,

  isBoostExpired,

} from "@/lib/monetization/profileBoost";

import type { ProfileBoostState } from "@/types/profileBoost";



const PAYMENTS_KEY = "pb_payments";

const BOOST_STATE_KEY = "pb_profile_boost_state";



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



interface BoostState {

  boostType: "free" | "paid" | null;

  expiresAt: string | null;

  freeBoostGranted: boolean;

  expiryNotified?: boolean;

}



function readBoostStates(): Record<string, BoostState> {

  if (typeof window === "undefined") return {};

  try {

    const raw = localStorage.getItem(BOOST_STATE_KEY);

    return raw ? (JSON.parse(raw) as Record<string, BoostState>) : {};

  } catch {

    return {};

  }

}



function writeBoostStates(states: Record<string, BoostState>): void {

  localStorage.setItem(BOOST_STATE_KEY, JSON.stringify(states));

}



function addDays(days: number): string {

  const d = new Date();

  d.setDate(d.getDate() + days);

  return d.toISOString();

}



function daysRemaining(expiresAt: string | null): number {

  if (!expiresAt) return 0;

  const ms = new Date(expiresAt).getTime() - Date.now();

  if (ms <= 0) return 0;

  return Math.ceil(ms / (1000 * 60 * 60 * 24));

}



function toProfileBoostState(state: BoostState | undefined): ProfileBoostState {

  if (!state?.boostType || !state.expiresAt || isBoostExpired(state.expiresAt)) {

    if (state?.boostType && state.expiresAt && isBoostExpired(state.expiresAt)) {

      return {

        active: false,

        status: "expired",

        daysRemaining: 0,

        expiresAt: state.expiresAt,

        boostType: null,

      };

    }

    return {

      active: false,

      status: "none",

      daysRemaining: 0,

      expiresAt: null,

      boostType: null,

    };

  }



  return {

    active: true,

    status: state.boostType,

    daysRemaining: daysRemaining(state.expiresAt),

    expiresAt: state.expiresAt,

    boostType: state.boostType,

  };

}



/** Grant one-time 15-day free boost for new mock users. */

export function grantMockFreeBoostIfNeeded(userId: string): ProfileBoostState {

  const states = readBoostStates();

  const existing = states[userId];



  if (existing?.freeBoostGranted) {

    return toProfileBoostState(existing);

  }



  states[userId] = {

    boostType: "free",

    expiresAt: addDays(FREE_BOOST_DAYS),

    freeBoostGranted: true,

    expiryNotified: false,

  };

  writeBoostStates(states);

  return toProfileBoostState(states[userId]);

}



export function getMockProfileBoostState(userId: string): ProfileBoostState {

  const states = readBoostStates();

  return toProfileBoostState(states[userId]);

}



export function activateMockPaidBoost(userId: string): ProfileBoostState {

  const states = readBoostStates();

  const current = states[userId];

  const base =

    current?.boostType === "paid" &&

    current.expiresAt &&

    !isBoostExpired(current.expiresAt)

      ? new Date(current.expiresAt)

      : new Date();



  const expiresAt = new Date(base);

  expiresAt.setDate(expiresAt.getDate() + PAID_BOOST_DAYS);



  states[userId] = {

    boostType: "paid",

    expiresAt: expiresAt.toISOString(),

    freeBoostGranted: current?.freeBoostGranted ?? true,

    expiryNotified: false,

  };

  writeBoostStates(states);

  return toProfileBoostState(states[userId]);

}



export function getMockDiscoverBoostMeta(userId: string): {

  boostType: "free" | "paid" | null;

  boostExpiresAt: string | null;

} {

  const states = readBoostStates();

  const state = states[userId];

  if (!state?.boostType || !state.expiresAt || isBoostExpired(state.expiresAt)) {

    return { boostType: null, boostExpiresAt: null };

  }

  return { boostType: state.boostType, boostExpiresAt: state.expiresAt };

}



export function isMockProfileBoostActive(userId: string): boolean {

  const meta = getMockDiscoverBoostMeta(userId);

  return isAnyBoostActive({

    id: userId,

    boostType: meta.boostType,

    boostExpiresAt: meta.boostExpiresAt,

  });

}



export function setProfileBoosted(userId: string, boosted: boolean): void {

  const states = readBoostStates();

  if (boosted) {

    states[userId] = {

      boostType: "paid",

      expiresAt: addDays(PAID_BOOST_DAYS),

      freeBoostGranted: states[userId]?.freeBoostGranted ?? true,

      expiryNotified: false,

    };

  } else {

    delete states[userId];

  }

  writeBoostStates(states);

}



/** @deprecated Use getMockProfileBoostState */

export function isProfileBoosted(userId: string): boolean {

  return isMockProfileBoostActive(userId);

}



/** @deprecated Impression-based boosts removed */

export function getProfileBoostImpressions(_userId: string): number {

  return 0;

}



/** @deprecated Impression-based boosts removed */

export function activateProfileBoost(userId: string): boolean {

  activateMockPaidBoost(userId);

  return true;

}



/** @deprecated Impression-based boosts removed */
export function consumeProfileBoostImpressions(_userIds: string[]): void {
  // no-op
}

export function markMockBoostExpiryNotified(userId: string): void {
  const states = readBoostStates();
  const state = states[userId];
  if (!state) return;
  state.expiryNotified = true;
  writeBoostStates(states);
}

export function shouldMockNotifyExpiry(userId: string): boolean {
  const states = readBoostStates();
  const state = states[userId];
  if (!state?.expiresAt || state.expiryNotified) return false;
  if (isBoostExpired(state.expiresAt)) return false;
  return daysRemaining(state.expiresAt) <= 3;
}
