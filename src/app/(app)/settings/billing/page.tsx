import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TIERS } from "@/lib/product";
import { isStripeConfigured } from "@/lib/stripe";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { SubscribeButton, ManageBillingButton } from "./CheckoutButtons";

export default async function BillingPage() {
  const session = await auth();
  const subscription = await prisma.billingSubscription.findUnique({ where: { userId: session!.user.id } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Billing</h1>
        <p className="mt-1 text-sm text-muted">Manage your Genevieve subscription.</p>
      </div>

      {!isStripeConfigured() && (
        <Card className="border-status-yellow/40">
          <p className="text-sm text-status-yellow">
            Billing isn&rsquo;t fully configured yet — Stripe API keys are still needed before checkout will
            work.
          </p>
        </Card>
      )}

      {subscription && subscription.status !== "CANCELED" ? (
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Current plan</p>
          <p className="mt-1 font-display text-2xl text-ivory">{TIERS[subscription.tier].label}</p>
          <p className="mt-1 text-sm text-muted">
            Status: {subscription.status}
            {subscription.currentPeriodEnd &&
              ` · renews ${formatDate(subscription.currentPeriodEnd)}`}
          </p>
          <div className="mt-4">
            <ManageBillingButton />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.values(TIERS).map((tier) => (
            <Card key={tier.id}>
              <h3 className="font-display text-xl text-ivory">{tier.label}</h3>
              <p className="mt-1 text-sm text-muted">{tier.description}</p>
              <p className="mt-4 font-display text-2xl text-gold">{tier.priceLabel}</p>
              <div className="mt-4">
                <SubscribeButton tier={tier.id} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted">
        Payments are processed securely by Stripe. Apple Pay and Google Pay are offered automatically on
        supported devices at checkout. All prices in AUD.
      </p>
    </div>
  );
}
