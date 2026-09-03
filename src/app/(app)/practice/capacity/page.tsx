import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { classifyCapacity, utilisationTrend } from "@/lib/engine";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { CapacityForm } from "./CapacityForm";

export default async function CapacityPage() {
  const session = await auth();
  const snapshots = await prisma.capacitySnapshot.findMany({
    where: { userId: session!.user.id },
    orderBy: { periodStart: "desc" },
  });

  const rows = snapshots.map((s, i) => {
    const engineSnapshot = {
      id: s.id,
      availableUnits: Number(s.availableUnits),
      filledUnits: Number(s.filledUnits),
      waitingDemandUnits: Number(s.waitingDemandUnits),
      referralDemandUnits: Number(s.referralDemandUnits),
      cancellationUnits: Number(s.cancellationUnits),
      approvedNonWorkingUnits: Number(s.approvedNonWorkingUnits),
    };
    const breakdown = classifyCapacity(engineSnapshot);
    const previous = snapshots[i + 1]; // list is newest-first, so i+1 is the prior period
    const trend = previous
      ? utilisationTrend(
          classifyCapacity({
            id: previous.id,
            availableUnits: Number(previous.availableUnits),
            filledUnits: Number(previous.filledUnits),
            waitingDemandUnits: Number(previous.waitingDemandUnits),
            referralDemandUnits: Number(previous.referralDemandUnits),
            cancellationUnits: Number(previous.cancellationUnits),
            approvedNonWorkingUnits: Number(previous.approvedNonWorkingUnits),
          }).utilisationPercent,
          breakdown.utilisationPercent,
        )
      : null;

    return { snapshot: s, breakdown, trend };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Capacity &amp; Utilisation</h1>
        <p className="mt-1 text-sm text-muted">
          Approved non-working time is never counted as avoidable. Recoverable capacity is idle time that
          existing waiting/referral demand could actually fill.
        </p>
      </div>

      <CapacityForm />

      <div className="flex flex-col gap-3">
        {rows.map(({ snapshot: s, breakdown, trend }) => (
          <Card key={s.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-ivory">{s.label}</p>
              <span className="text-xs text-muted">
                {formatDate(s.periodStart)} – {formatDate(s.periodEnd)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted">Utilisation</p>
                <p className="text-ivory">
                  {breakdown.utilisationPercent}%{" "}
                  {trend && <span className="text-xs text-muted">({trend.toLowerCase()})</span>}
                </p>
              </div>
              <div>
                <p className="text-muted">Idle</p>
                <p className="text-ivory">{breakdown.idleUnits}</p>
              </div>
              <div>
                <p className="text-muted">Recoverable</p>
                <p className="text-status-yellow">{breakdown.recoverableUnits}</p>
              </div>
              <div>
                <p className="text-muted">Legitimate spare</p>
                <p className="text-ivory">{breakdown.legitimateSpareUnits}</p>
              </div>
            </div>
            {s.notes && <p className="text-xs text-muted">{s.notes}</p>}
          </Card>
        ))}
        {rows.length === 0 && (
          <Card>
            <p className="text-sm text-muted">No capacity snapshots recorded yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
