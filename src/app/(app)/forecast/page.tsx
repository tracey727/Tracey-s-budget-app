import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMoneyPosition } from "@/lib/data/money";
import { projectCashFlow } from "@/lib/engine";
import { formatMoney, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";

export default async function ForecastPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [position, payCycles] = await Promise.all([
    getMoneyPosition(userId),
    prisma.payCycle.findMany({ where: { userId } }),
  ]);

  const referenceDate = new Date();
  const forecast = projectCashFlow(
    position.breakdown.totalBalance,
    position.bills.map((b) => ({
      id: b.id,
      name: b.name,
      amount: Number(b.amount),
      dueDate: b.dueDate,
      frequency: b.frequency,
    })),
    payCycles.map((p) => ({
      label: p.label,
      amount: Number(p.incomeAmount),
      nextDate: p.nextPayDate,
      frequency: p.frequency,
    })),
    90,
    referenceDate,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Forecast</h1>
        <p className="mt-1 text-sm text-muted">
          A 90-day projection from today&rsquo;s balance — a what-if scenario, not a change to your real
          ledger.
        </p>
      </div>

      {forecast.firstShortfallDate ? (
        <Card className="border-status-red/40">
          <p className="text-status-red">
            Projected shortfall around {formatDate(forecast.firstShortfallDate)}. Review upcoming bills or
            income before it happens.
          </p>
        </Card>
      ) : (
        <Card className="border-status-green/40">
          <p className="text-status-green">No shortfall projected in the next 90 days.</p>
        </Card>
      )}

      <Card>
        <p className="text-xs uppercase tracking-wide text-muted">Projected balance in 90 days</p>
        <p className="mt-1 font-display text-3xl text-ivory">{formatMoney(forecast.endingBalance)}</p>
      </Card>

      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
        {forecast.events.length === 0 && (
          <p className="p-4 text-sm text-muted">No upcoming bills or pay cycles to forecast yet.</p>
        )}
        {forecast.events.map((event, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-ivory">{event.label}</p>
              <p className="text-xs text-muted">{formatDate(event.date)}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm ${event.amount < 0 ? "text-status-red" : "text-status-green"}`}>
                {event.amount < 0 ? "" : "+"}
                {formatMoney(event.amount)}
              </p>
              <p className={`text-xs ${event.runningBalance < 0 ? "text-status-red" : "text-muted"}`}>
                Balance {formatMoney(event.runningBalance)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
