import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Reports &amp; Export</h1>
        <p className="mt-1 text-sm text-muted">
          Your data, in a format you can take to an accountant or adviser, or keep as your own backup.
        </p>
      </div>

      <Card>
        <p className="text-ivory">Transactions (CSV)</p>
        <p className="mt-1 text-sm text-muted">All logged transactions, including classification.</p>
        <LinkButton href="/api/export/transactions" className="mt-3">
          Download CSV
        </LinkButton>
      </Card>
    </div>
  );
}
