import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabaseServer";
import { createPaymentServer } from "@/lib/db/paymentsServer";
import { isRazorpayConfigured } from "@/lib/payments/isRazorpayConfigured";
import { getRazorpayClient, toPaise } from "@/lib/payments/razorpayServer";
import type { PaymentKind } from "@/types/payment";

const VALID_KINDS: PaymentKind[] = [
  "tournament_fee",
  "court_booking",
  "profile_boost",
  "subscription",
];

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Razorpay is not configured" },
      { status: 503 }
    );
  }

  try {
    const supabase = await createAuthenticatedSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      kind?: PaymentKind;
      refId?: string | null;
      amount?: number;
      description?: string;
    };

    const kind = body.kind;
    const amount = body.amount;

    if (!kind || !VALID_KINDS.includes(kind)) {
      return NextResponse.json({ error: "Invalid payment kind" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const receipt = `pb_${kind}_${Date.now()}`;
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: toPaise(amount),
      currency: "INR",
      receipt,
      notes: {
        user_id: user.id,
        kind,
        ref_id: body.refId ?? "",
      },
    });

    const payment = await createPaymentServer({
      userId: user.id,
      kind,
      refId: body.refId ?? null,
      amount,
      status: "pending",
      gateway: "razorpay",
      gatewayOrderId: order.id,
      currency: "INR",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      paymentId: payment.id,
      description: body.description ?? "PickleBuzz payment",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
