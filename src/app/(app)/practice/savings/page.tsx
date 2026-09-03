import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { summariseSavings } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { ApproveForm, CreateManualCaseForm, ImplementButton, MeasureForm, VerifyForm } from "./SavingsForms";

const CATEGORY_LABELS: Record<string, string> = {
  RECOVERED_REVENUE: "Recovered revenue",
  AVOIDED_COST: "Avoided cost",
  RELEASED_STAFF_TIME: "Released staff time",
};

const STATE_LABELS: Record<string, string> = {
  POTENTIAL: "Potential",
  APPROVED: "Approved",
  IMPLEMENTED: "Implemented",
  MEASURED: "Measured",
  VERIFIED: "Verified",
};

export default async function SavingsLedgerPage() {
  const session = await auth();
  const cases = await prisma.savingsCase.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  const summary = summariseSavings(
    cases.map((c) => ({
      category: c.category,
      state: c.state,
      baselineValue: Number(c.baselineValue),
      postValue: c.postValue != null ? Number(c.postValue) : null,
    })),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Verified Savings Ledger</h1>
        <p className="mt-1 text-sm text-muted">
          Every headline figure below is reconstructed live from the case rows underneath it — nothing here is
          a disconnected calculation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs uppercase text-muted">Verified revenue</p>
          <p className="mt-1 font-display text-xl text-ivory">{formatMoney(summary.verifiedRecoveredRevenue)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Verified avoided cost</p>
          <p className="mt-1 font-display text-xl text-ivory">{formatMoney(summary.verifiedAvoidedCost)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Verified staff minutes released</p>
          <p className="mt-1 font-display text-xl text-ivory">{summary.verifiedReleasedTimeMinutes} min</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Potential (unverified)</p>
          <p className="mt-1 font-display text-xl text-ivory">{formatMoney(summary.potentialValue)}</p>
        </Card>
      </div>

      <CreateManualCaseForm />

      <div className="flex flex-col gap-3">
        {cases.map((c) => (
          <Card key={c.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-ivory">{c.title}</p>
                <p className="text-xs text-muted">
                  {CATEGORY_LABELS[c.category]} · {c.sourceType === "MANUAL" ? "manual entry" : `from ${c.sourceType.toLowerCase().replace("_", " ")}`}
                </p>
                {c.description && <p className="text-xs text-muted">{c.description}</p>}
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {STATE_LABELS[c.state]}
              </span>
            </div>

            <p className="text-xs text-muted">
              Baseline: {Number(c.baselineValue)} {c.baselineUnit === "CURRENCY" ? "AUD" : "min"}
              {c.postValue != null && ` → Actual: ${Number(c.postValue)} ${c.baselineUnit === "CURRENCY" ? "AUD" : "min"}`}
            </p>
            <p className="text-xs text-muted">Method: {c.calculationMethod}</p>
            {c.evidenceNote && <p className="text-xs text-status-green">Evidence: {c.evidenceNote}</p>}
            {c.verifiedBy && <p className="text-xs text-muted">Verified by {c.verifiedBy}</p>}

            {c.state === "POTENTIAL" && <ApproveForm caseId={c.id} />}
            {c.state === "APPROVED" && <ImplementButton caseId={c.id} />}
            {c.state === "IMPLEMENTED" && <MeasureForm caseId={c.id} />}
            {c.state === "MEASURED" && <VerifyForm caseId={c.id} />}
          </Card>
        ))}
        {cases.length === 0 && (
          <Card>
            <p className="text-sm text-muted">No savings cases yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
