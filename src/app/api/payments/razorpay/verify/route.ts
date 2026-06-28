import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabaseServer";
import {
  getPaymentByOrderIdServer,
  markPaymentPaidServer,
} from "@/lib/db/paymentsServer";
import { isRazorpayConfigured } from "@/lib/payments/isRazorpayConfigured";
import { verifyPaymentSignature } from "@/lib/payments/razorpayServer";

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
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const existing = await getPaymentByOrderIdServer(orderId);
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (existing.status === "paid") {
      return NextResponse.json({ ok: true, payment: existing });
    }

    const valid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payment = await markPaymentPaidServer({
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Could not update payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, payment });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
