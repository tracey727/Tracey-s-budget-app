import Stripe from "stripe";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// See src/lib/prisma.ts for why this can't be a top-level `const`: the
// Worker's env bindings only exist inside a request's execution context,
// not on `process.env` at module-load time.
let stripeSingleton: Stripe | undefined;

function getStripeSecretKey(): string {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;

  try {
    const env = getCloudflareContext().env as unknown as { STRIPE_SECRET_KEY?: string };
    if (env.STRIPE_SECRET_KEY) return env.STRIPE_SECRET_KEY;
  } catch {
    // getCloudflareContext throws outside of a Workers request context.
  }

  return "sk_test_placeholder";
}

function getStripe(): Stripe {
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(getStripeSecretKey(), {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
      // Workers runtime has no Node `https` module — Stripe's fetch-based HTTP
      // client works in both Node and Workers, so use it everywhere.
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return stripeSingleton;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe() as object, prop, receiver);
  },
});

export function isStripeConfigured(): boolean {
  return getStripeSecretKey() !== "sk_test_placeholder";
}
