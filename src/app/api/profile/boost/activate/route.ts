import { NextResponse } from "next/server";
import { PAID_BOOST_DAYS } from "@/lib/monetization/profileBoost";
import { activatePaidProfileBoostForUser } from "@/lib/db/profileBoostServer";
import { createPaymentPlaceholder } from "@/lib/db/payments";
import { PRICING } from "@/lib/monetization/pricing";
import { isRazorpayConfigured } from "@/lib/payments/isRazorpayConfigured";
import { createAuthenticatedSupabaseClient } from "@/lib/supabaseServer";

/** Dev/mock activation when Razorpay is not configured. */
export async function POST(request: Request) {
  if (isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Use Razorpay checkout to purchase a profile boost." },
      { status: 400 }
    );
  }

  const supabase = await createAuthenticatedSupabaseClient(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const status = await activatePaidProfileBoostForUser(supabase);

  if (!status) {
    return NextResponse.json(
      { error: "Could not activate boost." },
      { status: 500 }
    );
  }

  await createPaymentPlaceholder({
    userId: user.id,
    kind: "profile_boost",
    amount: PRICING.profileBoost,
    status: "paid",
  });

  return NextResponse.json({
    ...status,
    planDays: PAID_BOOST_DAYS,
  });
}
