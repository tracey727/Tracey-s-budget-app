import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMoneyPosition } from "@/lib/data/money";
import { formatMoney, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function HomePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [position, nextPayCycle, goals, recurringDueForReview] = await Promise.all([
    getMoneyPosition(userId),
    prisma.payCycle.findFirst({ where: { userId }, orderBy: { nextPayDate: "asc" } }),
    prisma.savingsGoal.findMany({ where: { userId }, take: 3, orderBy: { createdAt: "desc" } }),
    prisma.recurringCharge.count({ where: { userId, reviewStatus: "UNREVIEWED" } }),
  ]);

  const upcomingBills = position.billStatuses
    .filter((b) => b.status !== "FUNDED")
    .sort((a, b) => a.bill.dueDate.getTime() - b.bill.dueDate.getTime())
    .slice(0, 3);

  const actions: { label: string; href: string }[] = [];
  if (position.statusResult.status === "RED" || position.statusResult.status === "RECOVERY") {
    actions.push({ label: "Review your Recovery plan", href: "/recovery" });
  }
  if (upcomingBills.some((b) => b.status === "AT_RISK" || b.status === "OVERDUE")) {
    actions.push({ label: "Fund an at-risk bill", href: "/bills" });
  }
  if (recurringDueForReview > 0) {
    actions.push({ label: `Review ${recurringDueForReview} subscription${recurringDueForReview > 1 ? "s" : ""}`, href: "/subscriptions" });
  }
  if (actions.length === 0) {
    actions.push({ label: "Log today's spending", href: "/transactions" });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-muted">Safe-to-Spend</p>
        <p className="mt-1 font-display text-5xl text-ivory">{formatMoney(position.breakdown.safeToSpend)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StatusBadge status={position.statusResult.status} />
          <p className="text-sm text-muted">{position.statusResult.reason}</p>
        </div>
      </div>

      {nextPayCycle && (
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Next payday</p>
          <p className="mt-1 text-lg text-ivory">
            {formatDate(nextPayCycle.nextPayDate)} · {formatMoney(nextPayCycle.incomeAmount)}
          </p>
        </Card>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-ivory">Next up</h2>
          <Link href="/bills" className="text-sm text-gold">
            View all bills
          </Link>
        </div>
        {upcomingBills.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">All bills are funded. Nothing urgent right now.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {upcomingBills.map(({ bill, status }) => (
              <Card key={bill.id}>
                <p className="text-sm text-ivory">{bill.name}</p>
                <p className="mt-1 font-display text-xl text-ivory">{formatMoney(bill.amount)}</p>
                <p className="mt-1 text-xs text-muted">Due {formatDate(bill.dueDate)}</p>
                <p
                  className={`mt-2 text-xs font-medium ${
                    status === "OVERDUE" || status === "AT_RISK" ? "text-status-red" : "text-status-yellow"
                  }`}
                >
                  {status.replace("_", " ")}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Accounts</p>
          <p className="mt-1 font-display text-2xl text-ivory">{formatMoney(position.breakdown.totalBalance)}</p>
          <Link href="/accounts" className="mt-2 inline-block text-sm text-gold">
            Manage accounts →
          </Link>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Protected for bills</p>
          <p className="mt-1 font-display text-2xl text-ivory">{formatMoney(position.breakdown.protectedForBills)}</p>
          <Link href="/bills" className="mt-2 inline-block text-sm text-gold">
            View bills calendar →
          </Link>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Savings goals</p>
          <p className="mt-1 font-display text-2xl text-ivory">{goals.length}</p>
          <Link href="/goals" className="mt-2 inline-block text-sm text-gold">
            View goals →
          </Link>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg text-ivory">
          {position.statusResult.status === "RECOVERY" ? "Recovery actions" : "What to do next"}
        </h2>
        <div className="flex flex-col gap-2">
          {actions.slice(0, 3).map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ivory hover:border-gold"
            >
              {action.label}
              <span className="text-gold">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
