/** Client-safe check — only the public key id is exposed to the browser. */
export function isRazorpayEnabled(): boolean {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) return false;
  return keyId !== "your-razorpay-key-id";
}
