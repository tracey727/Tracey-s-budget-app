import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMoneyPosition, getPayPeriodDays } from "@/lib/data/money";
import { formatMoney, formatDate } from "@/lib/format";
import { addDays, frequencyDays } from "@/lib/engine";
import { Card } from "@/components/ui/Card";
import { AddBillForm } from "./AddBillForm";
import { archiveBill, markBillPaid } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  FUNDED: "text-status-green",
  PARTIALLY_FUNDED: "text-status-yellow",
  DUE_NEXT: "text-muted",
  AT_RISK: "text-status-red",
  OVERDUE: "text-status-red",
};

export default async function BillsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [accounts, position, payPeriodDays] = await Promise.all([
    prisma.account.findMany({ where: { userId, archived: false }, select: { id: true, name: true } }),
    getMoneyPosition(userId),
    getPayPeriodDays(userId),
  ]);

  const sorted = [...position.billStatuses].sort((a, b) => a.bill.dueDate.getTime() - b.bill.dueDate.getTime());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Bills &amp; Calendar</h1>
        <p className="mt-1 text-sm text-muted">
          Reserved: {formatMoney(position.breakdown.protectedForBills)} protected before discretionary
          spending.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map(({ bill, reserved, status }) => {
          const nextDueDate = addDays(bill.dueDate, frequencyDays(bill.frequency));
          return (
            <Card key={bill.id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-ivory">{bill.name}</p>
                <p className="text-xs text-muted">
                  Due {formatDate(bill.dueDate)} · {bill.frequency.toLowerCase()} ·{" "}
                  {bill.fundingMethod === "AVERAGED" ? "averaged" : "full amount"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg text-ivory">{formatMoney(bill.amount)}</p>
                <p className={`text-xs font-medium ${STATUS_STYLES[status]}`}>
                  {status.replace("_", " ")} · {formatMoney(reserved)} reserved
                </p>
              </div>
              <div className="flex gap-3">
                <form action={markBillPaid}>
                  <input type="hidden" name="billId" value={bill.id} />
                  <input type="hidden" name="nextDueDate" value={nextDueDate.toISOString()} />
                  <button type="submit" className="text-xs text-gold">
                    Mark paid → roll to {formatDate(nextDueDate)}
                  </button>
                </form>
                <form action={archiveBill}>
                  <input type="hidden" name="billId" value={bill.id} />
                  <button type="submit" className="text-xs text-muted hover:text-status-red">
                    Archive
                  </button>
                </form>
              </div>
            </Card>
          );
        })}
        {sorted.length === 0 && (
          <Card>
            <p className="text-sm text-muted">No bills yet. Add one to start protecting it.</p>
          </Card>
        )}
      </div>

      {accounts.length > 0 ? (
        <AddBillForm accounts={accounts} />
      ) : (
        <p className="text-sm text-muted">Add an account first before adding bills.</p>
      )}

      <p className="text-xs text-muted">Pay period used for reservation timing: {payPeriodDays} days.</p>
    </div>
  );
}
