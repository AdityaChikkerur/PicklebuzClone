import { createServerSupabaseClient } from "@/lib/supabaseServer";
import type { DbPayment, Payment, PaymentGateway, PaymentKind, PaymentStatus } from "@/types/payment";

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

export async function createPaymentServer(input: {
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
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
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
    throw new Error(error?.message ?? "Could not create payment");
  }

  return mapDbPayment(data as DbPayment);
}

export async function getPaymentByOrderIdServer(
  gatewayOrderId: string
): Promise<Payment | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("gateway_order_id", gatewayOrderId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbPayment(data as DbPayment);
}

export async function markPaymentPaidServer(input: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
}): Promise<Payment | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      gateway_payment_id: input.gatewayPaymentId,
    })
    .eq("gateway_order_id", input.gatewayOrderId)
    .select("*")
    .maybeSingle();

  if (error || !data) return null;
  return mapDbPayment(data as DbPayment);
}
