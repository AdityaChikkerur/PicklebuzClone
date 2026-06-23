export function isRazorpayConfigured(): boolean {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return false;

  const placeholders = ["your-razorpay-key-id", "your-razorpay-key-secret"];
  if (placeholders.includes(keyId) || placeholders.includes(keySecret)) {
    return false;
  }

  return true;
}
