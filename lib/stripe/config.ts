export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3002";

/**
 * What EVOLUSA charges a professional for one real, confirmed connection —
 * never the member. Matches the promise already made in the professional
 * application page copy ("solo pagas por la conexión cuando ya es real").
 * A flat fee, not a percentage, since EVOLUSA never sees the value of the
 * professional's own engagement with the member.
 */
export const CONNECTION_FEE_CENTS = 2500;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}
