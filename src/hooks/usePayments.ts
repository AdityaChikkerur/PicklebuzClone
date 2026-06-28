"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createPaymentPlaceholder } from "@/lib/db/payments";
import type { PaymentKind, PaymentPlaceholder } from "@/types/payment";

export function usePayments(userId: string | undefined) {
  const [payments, setPayments] = useState<PaymentPlaceholder[]>([]);
  const [loading, setLoading] = useState(false);

  const recordPayment = useCallback(
    async (input: {
      kind: PaymentKind;
      refId?: string | null;
      amount: number;
      status?: "pending" | "paid";
      successMessage?: string;
    }) => {
      if (!userId) {
        toast.error("Sign in to continue");
        return null;
      }

      try {
        const payment = await createPaymentPlaceholder({
          userId,
          kind: input.kind,
          refId: input.refId,
          amount: input.amount,
          status: input.status ?? "pending",
        });
        setPayments((prev) => [payment, ...prev]);
        toast.success(
          input.successMessage ?? "Payment recorded successfully"
        );
        return payment;
      } catch {
        toast.error("Could not record payment");
        return null;
      }
    },
    [userId]
  );

  useEffect(() => {
    if (!userId) {
      setPayments([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    import("@/lib/db/payments").then(({ fetchUserPayments }) => {
      void fetchUserPayments(userId).then((rows) => {
        if (!cancelled) {
          setPayments(rows);
          setLoading(false);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { payments, loading, recordPayment };
}
