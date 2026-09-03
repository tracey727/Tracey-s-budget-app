import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { classifyCapacity, isRenewalApproaching, rankPatternsByImpact, summariseSavings } from "@/lib/engine";
import { DEFAULT_LABOUR_RATE_AUD_PER_HOUR } from "@/lib/product";
import { formatMoney } from "@/lib/format";
import { Card } from "@/components/ui/Card";

export default async function PracticeDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [savingsCases, wasteEvents, capacitySnapshots, recurringCharges, patterns, openHighAlerts] =
    await Promise.all([
      prisma.savingsCase.findMany({ where: { userId } }),
      prisma.wasteEvent.findMany({ where: { userId } }),
      prisma.capacitySnapshot.findMany({ where: { userId }, orderBy: { periodStart: "desc" }, take: 1 }),
      prisma.recurringCharge.findMany({ where: { userId } }),
      prisma.systemicPattern.findMany({ where: { userId } }),
      prisma.notification.count({ where: { userId, severity: "HIGH", status: { not: "ACTIONED" } } }),
    ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfFinancialYear = new Date(now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1, 6, 1); // AU FY: 1 Jul

  const summaryAll = summariseSavings(
    savingsCases.map((c) => ({
      category: c.category,
      state: c.state,
      baselineValue: Number(c.baselineValue),
      postValue: c.postValue != null ? Number(c.postValue) : null,
    })),
  );
  const verifiedThisMonth = savingsCases.filter((c) => c.state === "VERIFIED" && c.verifiedAt && c.verifiedAt >= startOfMonth);
  const verifiedThisFY = savingsCases.filter((c) => c.state === "VERIFIED" && c.verifiedAt && c.verifiedAt >= startOfFinancialYear);
  const summaryMonth = summariseSavings(
    verifiedThisMonth.map((c) => ({ category: c.category, state: c.state, baselineValue: Number(c.baselineValue), postValue: Number(c.postValue) })),
  );
  const summaryFY = summariseSavings(
    verifiedThisFY.map((c) => ({ category: c.category, state: c.state, baselineValue: Number(c.baselineValue), postValue: Number(c.postValue) })),
  );

  const wasteByStatus = wasteEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  const latestCapacity = capacitySnapshots[0]
    ? classifyCapacity({
        id: capacitySnapshots[0].id,
        availableUnits: Number(capacitySnapshots[0].availableUnits),
        filledUnits: Number(capacitySnapshots[0].filledUnits),
        waitingDemandUnits: Number(capacitySnapshots[0].waitingDemandUnits),
        referralDemandUnits: Number(capacitySnapshots[0].referralDemandUnits),
        cancellationUnits: Number(capacitySnapshots[0].cancellationUnits),
        approvedNonWorkingUnits: Number(capacitySnapshots[0].approvedNonWorkingUnits),
      })
    : null;

  const renewalsApproaching = recurringCharges.filter(
    (c) => c.reviewStatus !== "CANCELLED" && isRenewalApproaching(c.renewalDate, now, 30),
  ).length;
  const duplicateCosts = recurringCharges.filter((c) => c.isDuplicate).length;

  const topPatterns = rankPatternsByImpact(
    patterns
      .filter((p) => p.status !== "MEASURED")
      .map((p) => ({
        id: p.id,
        estimatedImpactMinutes: p.estimatedImpactMinutes != null ? Number(p.estimatedImpactMinutes) : null,
        estimatedImpactCurrency: p.estimatedImpactCurrency != null ? Number(p.estimatedImpactCurrency) : null,
      })),
    DEFAULT_LABOUR_RATE_AUD_PER_HOUR,
  ).slice(0, 3);
  const patternById = new Map(patterns.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Practice Savings &amp; Revenue Protection Command</h1>
        <p className="mt-1 text-sm text-muted">
          Every number below drills down to the underlying records on its own page — nothing here is a
          disconnected calculation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs uppercase text-muted">Verified — this month</p>
          <p className="mt-1 font-display text-xl text-ivory">{formatMoney(summaryMonth.totalVerifiedBenefit)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Verified — financial year</p>
          <p className="mt-1 font-display text-xl text-ivory">{formatMoney(summaryFY.totalVerifiedBenefit)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Potential (unverified)</p>
          <p className="mt-1 font-display text-xl text-ivory">{formatMoney(summaryAll.potentialValue)}</p>
        </Card>
        <Card className={openHighAlerts > 0 ? "border-status-red/40" : undefined}>
          <p className="text-xs uppercase text-muted">Red alerts requiring action</p>
          <p className="mt-1 font-display text-xl text-status-red">{openHighAlerts}</p>
          <Link href="/practice/alerts" className="text-xs text-gold">
            View alerts →
          </Link>
        </Card>
      </div>

      <Card>
        <p className="text-xs uppercase text-muted">All-time verified benefit</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-muted text-xs">Recovered revenue</p>
            <p className="text-ivory">{formatMoney(summaryAll.verifiedRecoveredRevenue)}</p>
          </div>
          <div>
            <p className="text-muted text-xs">Avoided cost</p>
            <p className="text-ivory">{formatMoney(summaryAll.verifiedAvoidedCost)}</p>
          </div>
          <div>
            <p className="text-muted text-xs">Staff minutes released</p>
            <p className="text-ivory">{summaryAll.verifiedReleasedTimeMinutes} min</p>
          </div>
        </div>
        <Link href="/practice/savings" className="mt-3 inline-block text-xs text-gold">
          Open the savings ledger →
        </Link>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="mb-2 font-display text-lg text-ivory">Staff efficiency</p>
          <ul className="flex flex-col gap-1 text-sm text-muted">
            {Object.entries(wasteByStatus).map(([status, count]) => (
              <li key={status}>
                {status.replaceAll("_", " ").toLowerCase()}: {count}
              </li>
            ))}
            {wasteEvents.length === 0 && <li>No waste events logged yet.</li>}
          </ul>
          <Link href="/practice/waste" className="mt-3 inline-block text-xs text-gold">
            Open waste tracker →
          </Link>
        </Card>

        <Card>
          <p className="mb-2 font-display text-lg text-ivory">Capacity</p>
          {latestCapacity ? (
            <ul className="flex flex-col gap-1 text-sm text-muted">
              <li>Utilisation: {latestCapacity.utilisationPercent}%</li>
              <li>Recoverable idle: {latestCapacity.recoverableUnits}</li>
              <li>Legitimate spare: {latestCapacity.legitimateSpareUnits}</li>
            </ul>
          ) : (
            <p className="text-sm text-muted">No capacity snapshots recorded yet.</p>
          )}
          <Link href="/practice/capacity" className="mt-3 inline-block text-xs text-gold">
            Open capacity tracker →
          </Link>
        </Card>

        <Card>
          <p className="mb-2 font-display text-lg text-ivory">Recurring cost review</p>
          <ul className="flex flex-col gap-1 text-sm text-muted">
            <li>Renewals approaching (30 days): {renewalsApproaching}</li>
            <li>Flagged possible duplicates: {duplicateCosts}</li>
          </ul>
          <Link href="/subscriptions" className="mt-3 inline-block text-xs text-gold">
            Open subscriptions & cost review →
          </Link>
        </Card>

        <Card>
          <p className="mb-2 font-display text-lg text-ivory">Top systemic patterns</p>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            {topPatterns.map((p) => (
              <li key={p.id}>
                {patternById.get(p.id)?.title} — {formatMoney(p.combinedImpactValue)} est. impact
              </li>
            ))}
            {topPatterns.length === 0 && <li>No open patterns.</li>}
          </ul>
          <Link href="/practice/patterns" className="mt-3 inline-block text-xs text-gold">
            Open pattern command →
          </Link>
        </Card>
      </div>

      <Card className="border-border/60">
        <p className="text-xs text-muted">
          Referral, reception, appointment-leakage, work-ownership and leave/handover panels (blueprint Phases
          7–11) are not part of this build — this build was scoped to start at Phase 12. See{" "}
          <code className="text-ivory">docs/practice-savings/00_SCOPE_NOTE.md</code> for what would need to be
          built first to add them.
        </p>
      </Card>
    </div>
  );
}
