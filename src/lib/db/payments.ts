import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import {
  getMockPayments,
  recordMockPayment,
} from "@/lib/mock/paymentMockData";
import { createClient } from "@/lib/supabase";
import type {
  DbPayment,
  Payment,
  PaymentGateway,
  PaymentKind,
  PaymentStatus,
} from "@/types/payment";

const PAYMENTS_TABLE = "payments";

function mapDbPayment(row: DbPayment): Payment {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    refId: row.ref_id,
    amount: row.amount ?? 0,
    currency: row.currency ?? "INR",
    status: row.status,
    gateway: row.gateway ?? "placeholder",
    gatewayOrderId: row.gateway_order_id,
    gatewayPaymentId: row.gateway_payment_id,
    createdAt: row.created_at,
  };
}

export async function fetchUserPayments(userId: string): Promise<Payment[]> {
  if (!isSupabaseConfigured()) {
    return getMockPayments(userId);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(PAYMENTS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return getMockPayments(userId);
    return (data as DbPayment[]).map(mapDbPayment);
  } catch {
    return getMockPayments(userId);
  }
}

export async function createPaymentPlaceholder(input: {
  userId: string;
  kind: PaymentKind;
  refId?: string | null;
  amount: number;
  status?: PaymentStatus;
}): Promise<Payment> {
  return createPayment({
    ...input,
    gateway: "placeholder",
    status: input.status ?? "pending",
  });
}

export async function createPayment(input: {
  userId: string;
  kind: PaymentKind;
  refId?: string | null;
  amount: number;
  status?: PaymentStatus;
  gateway?: PaymentGateway;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  currency?: string;
}): Promise<Payment> {
  if (!isSupabaseConfigured()) {
    return recordMockPayment(input);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(PAYMENTS_TABLE)
      .insert({
        user_id: input.userId,
        kind: input.kind,
        ref_id: input.refId ?? null,
        amount: input.amount,
        currency: input.currency ?? "INR",
        status: input.status ?? "pending",
        gateway: input.gateway ?? "placeholder",
        gateway_order_id: input.gatewayOrderId ?? null,
        gateway_payment_id: input.gatewayPaymentId ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      return recordMockPayment(input);
    }

    return mapDbPayment(data as DbPayment);
  } catch {
    return recordMockPayment(input);
  }
}
