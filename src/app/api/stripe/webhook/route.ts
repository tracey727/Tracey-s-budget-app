import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type { TierId } from "@/lib/product";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId ?? checkoutSession.client_reference_id;
      const tier = (checkoutSession.metadata?.tier as TierId | undefined) ?? "PERSONAL";
      const customerId =
        typeof checkoutSession.customer === "string" ? checkoutSession.customer : checkoutSession.customer?.id;
      const subscriptionId =
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription?.id;

      if (userId && customerId) {
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId, tier },
        });
      }

      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertBillingSubscription(userId, tier, subscription);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      const tier = (subscription.metadata?.tier as TierId | undefined) ?? "PERSONAL";
      if (userId) {
        await upsertBillingSubscription(userId, tier, subscription);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await prisma.billingSubscription.updateMany({
          where: { userId },
          data: { status: "CANCELED", cancelAtPeriodEnd: false },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function upsertBillingSubscription(userId: string, tier: TierId, subscription: Stripe.Subscription) {
  const status = mapStripeStatus(subscription.status);
  const currentPeriodEndUnix = subscription.items.data[0]?.current_period_end;

  await prisma.billingSubscription.upsert({
    where: { userId },
    create: {
      userId,
      tier,
      status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      currentPeriodEnd: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      tier,
      status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      currentPeriodEnd: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  if (status === "ACTIVE" || status === "TRIALING") {
    await prisma.user.update({ where: { id: userId }, data: { tier } });
  }
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "UNPAID" {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "unpaid":
      return "UNPAID";
    default:
      return "INCOMPLETE";
  }
}
