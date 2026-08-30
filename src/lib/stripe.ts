import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(secretKey, {
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
  // Workers runtime has no Node `https` module — Stripe's fetch-based HTTP
  // client works in both Node and Workers, so use it everywhere.
  httpClient: Stripe.createFetchHttpClient(),
});

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
