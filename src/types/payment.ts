export type PaymentKind =
  | "tournament_fee"
  | "court_booking"
  | "profile_boost"
  | "subscription";

export type PaymentStatus = "pending" | "paid" | "failed";

export type PaymentGateway = "placeholder" | "razorpay";

export interface Payment {
  id: string;
  userId: string;
  kind: PaymentKind;
  refId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  createdAt: string;
}

/** @deprecated Use Payment */
export type PaymentPlaceholder = Payment;

export interface DbPayment {
  id: string;
  user_id: string;
  kind: PaymentKind;
  ref_id: string | null;
  amount: number | null;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  created_at: string;
}

/** @deprecated Use DbPayment */
export type DbPaymentPlaceholder = DbPayment;

export const PAYMENT_KIND_LABELS: Record<PaymentKind, string> = {
  tournament_fee: "Tournament entry",
  court_booking: "Court booking",
  profile_boost: "Profile boost",
  subscription: "Premium subscription",
};
