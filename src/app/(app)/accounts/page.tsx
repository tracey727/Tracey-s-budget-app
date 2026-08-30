import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { AddAccountForm, UpdateBalanceForm } from "./AccountForms";
import { archiveAccount } from "./actions";

export default async function AccountsPage() {
  const session = await auth();
  const accounts = await prisma.account.findMany({
    where: { userId: session!.user.id, archived: false },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Accounts</h1>
        <p className="mt-1 text-sm text-muted">
          Opening balances are a fixed historical record. Update the live balance as it changes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {accounts.map((account) => (
          <Card key={account.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-ivory">{account.name}</p>
                <p className="text-xs uppercase tracking-wide text-muted">
                  {account.type === "PERSONAL" ? "Personal" : "Business operating"}
                </p>
              </div>
              <form action={archiveAccount}>
                <input type="hidden" name="accountId" value={account.id} />
                <button type="submit" className="text-xs text-muted hover:text-status-red">
                  Archive
                </button>
              </form>
            </div>

            <p className="mt-4 font-display text-2xl text-ivory">{formatMoney(account.currentBalance)}</p>
            <p className="text-xs text-muted">
              Opening {formatMoney(account.openingBalance)} on {formatDate(account.openingBalanceDate)}
            </p>

            <UpdateBalanceForm accountId={account.id} currentBalance={Number(account.currentBalance)} />
          </Card>
        ))}
      </div>

      <AddAccountForm />
    </div>
  );
}
