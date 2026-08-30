import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { StartRecoveryForm, UpdateProgressForm } from "./RecoveryForms";
import { resolveRecovery } from "./actions";

export default async function RecoveryPage() {
  const session = await auth();
  const [active, history] = await Promise.all([
    prisma.recoveryState.findFirst({ where: { userId: session!.user.id, active: true } }),
    prisma.recoveryState.findMany({
      where: { userId: session!.user.id, active: false },
      orderBy: { resolvedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Recovery · Back to Zero</h1>
        <p className="mt-1 text-sm text-muted">
          A controlled return-to-zero pathway — protected essentials come first.
        </p>
      </div>

      {active ? (
        <Card className="border-status-recovery/40">
          <p className="text-xs uppercase tracking-wide text-muted">Active recovery plan</p>
          <p className="mt-2 font-display text-2xl text-ivory">
            {formatMoney(active.progressAmount)}{" "}
            <span className="text-sm text-muted">of {formatMoney(active.targetAmount)} target</span>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-charcoal">
            <div
              className="h-full bg-status-recovery"
              style={{
                width: `${Math.min(100, (Number(active.progressAmount) / Math.max(1, Number(active.targetAmount))) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-3 text-sm text-muted">Started {formatDate(active.startedAt)}</p>
          {active.notes && <p className="mt-1 text-sm text-muted">{active.notes}</p>}

          <UpdateProgressForm recoveryId={active.id} progressAmount={Number(active.progressAmount)} />

          <form action={resolveRecovery} className="mt-3">
            <input type="hidden" name="recoveryId" value={active.id} />
            <button type="submit" className="text-xs text-gold">
              Mark recovery complete
            </button>
          </form>
        </Card>
      ) : (
        <StartRecoveryForm />
      )}

      {history.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg text-ivory">Past recoveries</h2>
          <div className="flex flex-col gap-2">
            {history.map((r) => (
              <Card key={r.id}>
                <p className="text-sm text-ivory">
                  {formatMoney(r.progressAmount)} of {formatMoney(r.targetAmount)}
                </p>
                <p className="text-xs text-muted">
                  {formatDate(r.startedAt)} — {r.resolvedAt ? formatDate(r.resolvedAt) : "in progress"}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
