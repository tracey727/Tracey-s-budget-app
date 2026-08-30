import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { summariseSpending, type EngineTransaction } from "@/lib/engine";
import { formatMoney, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { AddTransactionForm } from "./AddTransactionForm";
import { ReclassifySelect } from "./ReclassifySelect";

const CLASSIFICATION_LABELS: Record<string, string> = {
  ESSENTIAL: "Essential",
  WORTH_IT: "Worth it",
  UNSURE: "Unsure",
  WASTE: "Waste",
};

export default async function TransactionsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [accounts, transactions] = await Promise.all([
    prisma.account.findMany({ where: { userId, archived: false }, select: { id: true, name: true } }),
    prisma.transaction.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 50 }),
  ]);

  const engineTransactions: EngineTransaction[] = transactions.map((t) => ({
    id: t.id,
    accountId: t.accountId,
    amount: Number(t.amount),
    date: t.date,
    isTransfer: t.isTransfer,
    classification: t.classification ?? undefined,
  }));
  const summary = summariseSpending(engineTransactions);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Spending Intelligence</h1>
        <p className="mt-1 text-sm text-muted">
          Income {formatMoney(summary.income)} · Expenses {formatMoney(summary.expenses)} (transfers
          excluded)
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {(["ESSENTIAL", "WORTH_IT", "UNSURE", "WASTE"] as const).map((key) => (
          <Card key={key}>
            <p className="text-xs uppercase tracking-wide text-muted">{CLASSIFICATION_LABELS[key]}</p>
            <p className="mt-1 font-display text-xl text-ivory">{formatMoney(summary.byClassification[key])}</p>
          </Card>
        ))}
      </div>

      {accounts.length > 0 ? (
        <AddTransactionForm accounts={accounts} />
      ) : (
        <p className="text-sm text-muted">Add an account first before logging transactions.</p>
      )}

      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
        {transactions.length === 0 && <p className="p-4 text-sm text-muted">No transactions logged yet.</p>}
        {transactions.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm text-ivory">{t.description}</p>
              <p className="text-xs text-muted">
                {formatDate(t.date)} {t.isTransfer && "· transfer"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className={`font-display text-lg ${Number(t.amount) < 0 ? "text-ivory" : "text-status-green"}`}>
                {formatMoney(t.amount)}
              </p>
              {!t.isTransfer && Number(t.amount) < 0 && (
                <ReclassifySelect transactionId={t.id} current={t.classification} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
