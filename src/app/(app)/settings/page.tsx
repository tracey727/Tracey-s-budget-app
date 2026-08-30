import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { LEGAL_ENTITY } from "@/lib/product";

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Settings</h1>
      </div>

      <Card>
        <p className="text-xs uppercase tracking-wide text-muted">Account</p>
        <p className="mt-1 text-ivory">{user?.name}</p>
        <p className="text-sm text-muted">{user?.email}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-gold">{user?.tier} tier</p>
      </Card>

      <Card>
        <p className="text-ivory">Billing</p>
        <p className="mt-1 text-sm text-muted">Manage your subscription and payment method.</p>
        <Link href="/settings/billing" className="mt-2 inline-block text-sm text-gold">
          Go to billing →
        </Link>
      </Card>

      <Card>
        <p className="text-ivory">Data &amp; backup</p>
        <p className="mt-1 text-sm text-muted">Export your data or view legal information.</p>
        <div className="mt-2 flex flex-col gap-1">
          <Link href="/reports" className="text-sm text-gold">
            Export data →
          </Link>
          <Link href="/legal/terms" className="text-sm text-gold">
            Terms &amp; Conditions →
          </Link>
          <Link href="/legal/privacy" className="text-sm text-gold">
            Privacy Policy →
          </Link>
        </div>
      </Card>

      <p className="text-xs text-muted">
        {LEGAL_ENTITY.businessName} · ABN {LEGAL_ENTITY.abn} · {LEGAL_ENTITY.supportEmail}
      </p>
    </div>
  );
}
