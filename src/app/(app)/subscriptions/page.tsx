import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { annualiseCost, isRenewalApproaching } from "@/lib/engine";
import { formatMoney, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { AddChargeForm } from "./AddChargeForm";
import { ReviewButtons } from "./ReviewButtons";
import { CostDecisionForm } from "./CostDecisionForm";

export default async function SubscriptionsPage() {
  const session = await auth();
  const charges = await prisma.recurringCharge.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  const totalAnnual = charges.reduce(
    (sum, c) => sum + annualiseCost(Number(c.amount), c.frequency),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted">
          Small recurring amounts add up — here&rsquo;s their true yearly impact: {formatMoney(totalAnnual)}
          /year.
        </p>
      </div>

      <AddChargeForm />

      <div className="flex flex-col gap-3">
        {charges.map((charge) => (
          <Card key={charge.id} className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-ivory">
                {charge.name} {charge.isBusinessCost && <span className="text-xs text-muted">(business)</span>}
                {charge.isDuplicate && <span className="ml-2 text-xs text-status-yellow">possible duplicate</span>}
              </p>
              <p className="text-xs text-muted">
                {formatMoney(charge.amount)} / {charge.frequency.toLowerCase()} ·{" "}
                {formatMoney(annualiseCost(Number(charge.amount), charge.frequency))}/year
                {charge.owner && ` · owner: ${charge.owner}`}
              </p>
              {charge.renewalDate && (
                <p className="text-xs text-muted">
                  Renews {formatDate(charge.renewalDate)}
                  {isRenewalApproaching(charge.renewalDate, new Date(), 30) && charge.reviewStatus !== "CANCELLED" && (
                    <span className="ml-1 text-status-yellow">— review before renewal</span>
                  )}
                </p>
              )}
              {charge.decisionNote && (
                <p className="mt-1 text-xs text-muted">
                  Decision: {charge.decisionNote}
                  {charge.previousAmount != null && (
                    <> ({formatMoney(charge.previousAmount)} → {formatMoney(charge.amount)})</>
                  )}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <ReviewButtons chargeId={charge.id} current={charge.reviewStatus} />
              <CostDecisionForm chargeId={charge.id} currentAmount={Number(charge.amount)} />
            </div>
          </Card>
        ))}
        {charges.length === 0 && (
          <Card>
            <p className="text-sm text-muted">No subscriptions tracked yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
