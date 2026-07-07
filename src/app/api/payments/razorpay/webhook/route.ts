import { NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabaseAdmin";
import { PAID_BOOST_DAYS } from "@/lib/monetization/profileBoost";
import { isRazorpayConfigured } from "@/lib/payments/isRazorpayConfigured";
import { verifyWebhookSignature } from "@/lib/payments/razorpayServer";

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
}

export async function POST(request: Request) {
  if (!isRazorpayConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event;
  const entity = payload.payload?.payment?.entity;
  const orderId = entity?.order_id;
  const paymentId = entity?.id;

  if (
    (event === "payment.captured" || event === "order.paid") &&
    orderId &&
    paymentId
  ) {
    const supabase = createAdminSupabaseClient();

    const { data: paymentRow } = await supabase
      .from("payments")
      .select("user_id, kind, status")
      .eq("gateway_order_id", orderId)
      .maybeSingle();

    await supabase
      .from("payments")
      .update({
        status: "paid",
        gateway_payment_id: paymentId,
      })
      .eq("gateway_order_id", orderId)
      .eq("status", "pending");

    if (
      paymentRow?.kind === "profile_boost" &&
      paymentRow.user_id &&
      paymentRow.status !== "paid"
    ) {
      await supabase.rpc("activate_paid_profile_boost_for_user", {
        p_user_id: paymentRow.user_id,
        p_days: PAID_BOOST_DAYS,
      });
    }
  }

  return NextResponse.json({ received: true });
}
