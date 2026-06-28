"use client";

import { authFetch } from "@/lib/auth/clientFetch";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PaymentKind } from "@/types/payment";

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayHandlerResponse) => void) => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser"));
  }

  if (window.Razorpay) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

export function useRazorpayCheckout() {
  const [paying, setPaying] = useState(false);

  const startCheckout = useCallback(
    async (input: {
      kind: PaymentKind;
      refId?: string | null;
      amount: number;
      description?: string;
      prefill?: { name?: string; email?: string };
    }): Promise<boolean> => {
      setPaying(true);

      try {
        await loadRazorpayScript();

        const orderRes = await authFetch("/api/payments/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: input.kind,
            refId: input.refId,
            amount: input.amount,
            description: input.description,
          }),
        });

        const orderData = (await orderRes.json()) as {
          error?: string;
          orderId?: string;
          amount?: number;
          currency?: string;
          keyId?: string;
        };

        if (!orderRes.ok || !orderData.orderId || !orderData.keyId) {
          toast.error(orderData.error ?? "Could not start checkout");
          return false;
        }

        const paid = await new Promise<boolean>((resolve) => {
          const rzp = new window.Razorpay!({
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency ?? "INR",
            name: "PickleBuzz",
            description: input.description ?? "Payment",
            order_id: orderData.orderId,
            prefill: input.prefill,
            theme: { color: "#16a34a" },
            handler: async (response: RazorpayHandlerResponse) => {
              const verifyRes = await authFetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });

              if (verifyRes.ok) {
                resolve(true);
              } else {
                const verifyData = (await verifyRes.json()) as { error?: string };
                toast.error(verifyData.error ?? "Payment verification failed");
                resolve(false);
              }
            },
            modal: {
              ondismiss: () => resolve(false),
            },
          });

          rzp.open();
        });

        return paid;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Payment could not be completed";
        toast.error(message);
        return false;
      } finally {
        setPaying(false);
      }
    },
    []
  );

  return { paying, startCheckout };
}
