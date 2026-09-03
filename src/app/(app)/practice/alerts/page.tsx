import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { AcknowledgeButton, ActionedButton, CreateAlertRuleForm, RunCheckButton, ToggleRuleButton } from "./AlertForms";

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "text-muted",
  MEDIUM: "text-status-yellow",
  HIGH: "text-status-red",
};

export default async function AlertsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [rules, notifications] = await Promise.all([
    prisma.alertRule.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  const active = notifications.filter((n) => n.status !== "ACTIONED");
  const resolved = notifications.filter((n) => n.status === "ACTIONED");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Alerts, Notifications &amp; Accountability</h1>
        <p className="mt-1 text-sm text-muted">
          Each condition alerts once and stays open until acknowledged and actioned — re-running the check
          never creates a duplicate for the same open condition.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <RunCheckButton />
        <CreateAlertRuleForm />
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg text-ivory">Rules</h2>
        <div className="flex flex-col gap-2">
          {rules.map((rule) => (
            <Card key={rule.id} className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-ivory">{rule.name}</p>
                <p className="text-xs text-muted">
                  {rule.triggerType} · {rule.severity}
                  {rule.digestOnly && " · digest only"}
                </p>
              </div>
              <ToggleRuleButton ruleId={rule.id} enabled={rule.enabled} />
            </Card>
          ))}
          {rules.length === 0 && (
            <Card>
              <p className="text-sm text-muted">No alert rules configured yet.</p>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg text-ivory">Open notifications</h2>
        <div className="flex flex-col gap-2">
          {active.map((n) => (
            <Card key={n.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-semibold ${SEVERITY_COLOR[n.severity]}`}>{n.title}</p>
                  <p className="text-xs text-muted">{n.body}</p>
                </div>
                <span className="text-xs text-muted">{formatDate(n.createdAt)}</span>
              </div>
              <div className="flex gap-3 border-t border-border pt-2">
                {n.status === "UNREAD" && <AcknowledgeButton notificationId={n.id} />}
                <ActionedButton notificationId={n.id} />
              </div>
            </Card>
          ))}
          {active.length === 0 && (
            <Card>
              <p className="text-sm text-muted">No open notifications.</p>
            </Card>
          )}
        </div>
      </div>

      {resolved.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg text-ivory">Actioned</h2>
          <div className="flex flex-col gap-2">
            {resolved.slice(0, 10).map((n) => (
              <Card key={n.id}>
                <p className="text-sm text-muted">{n.title}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
