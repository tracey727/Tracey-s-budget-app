import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { TIERS, type TierId } from "@/lib/product";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tier = body?.tier as TierId | undefined;
  if (!tier || !(tier in TIERS)) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }

  const priceId = process.env[TIERS[tier].stripePriceEnvVar];
  if (!priceId) {
    return NextResponse.json({ error: "Pricing is not configured yet." }, { status: 503 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get("origin") ?? "";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    // Stripe Checkout automatically offers Apple Pay / Google Pay on supported
    // devices/browsers once the domain is verified — no extra integration needed.
    automatic_tax: { enabled: false },
    allow_promotion_codes: true,
    success_url: `${appUrl}/settings/billing?checkout=success`,
    cancel_url: `${appUrl}/settings/billing?checkout=cancelled`,
    metadata: { userId: user.id, tier },
    subscription_data: {
      metadata: { userId: user.id, tier },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
