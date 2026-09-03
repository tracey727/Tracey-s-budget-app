import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rankPatternsByImpact } from "@/lib/engine";
import { DEFAULT_LABOUR_RATE_AUD_PER_HOUR } from "@/lib/product";
import { formatDate, formatMoney } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import {
  AssignPreventionForm,
  CreatePatternForm,
  LinkEventForm,
  MeasurePatternForm,
  StartProgressButton,
} from "./PatternForms";

const STATUS_LABELS: Record<string, string> = {
  IDENTIFIED: "Identified",
  ACTION_ASSIGNED: "Action assigned",
  IN_PROGRESS: "In progress",
  MEASURED: "Measured",
};

export default async function PatternsPage() {
  const session = await auth();
  const patterns = await prisma.systemicPattern.findMany({
    where: { userId: session!.user.id },
    include: { events: true },
    orderBy: { createdAt: "desc" },
  });

  const ranked = rankPatternsByImpact(
    patterns.map((p) => ({
      id: p.id,
      estimatedImpactMinutes: p.estimatedImpactMinutes != null ? Number(p.estimatedImpactMinutes) : null,
      estimatedImpactCurrency: p.estimatedImpactCurrency != null ? Number(p.estimatedImpactCurrency) : null,
    })),
    DEFAULT_LABOUR_RATE_AUD_PER_HOUR,
  );
  const impactById = new Map(ranked.map((r) => [r.id, r.combinedImpactValue]));
  const sorted = [...patterns].sort(
    (a, b) => (impactById.get(b.id) ?? 0) - (impactById.get(a.id) ?? 0),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Systemic Pattern &amp; Prevention Command</h1>
        <p className="mt-1 text-sm text-muted">
          Ranked by estimated impact (minutes converted at {formatMoney(DEFAULT_LABOUR_RATE_AUD_PER_HOUR)}/hr for
          comparison only — the underlying minutes/dollar figures are always shown separately).
        </p>
      </div>

      <CreatePatternForm />

      <div className="flex flex-col gap-3">
        {sorted.map((pattern) => (
          <Card key={pattern.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-ivory">{pattern.title}</p>
                {pattern.description && <p className="text-xs text-muted">{pattern.description}</p>}
                {pattern.rootCause && <p className="text-xs text-muted">Root cause: {pattern.rootCause}</p>}
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {STATUS_LABELS[pattern.status] ?? pattern.status}
              </span>
            </div>

            <p className="text-xs text-muted">
              {pattern.estimatedImpactMinutes != null && `${Number(pattern.estimatedImpactMinutes)} min/occurrence`}
              {pattern.estimatedImpactMinutes != null && pattern.estimatedImpactCurrency != null && " · "}
              {pattern.estimatedImpactCurrency != null && `${formatMoney(pattern.estimatedImpactCurrency)}`}
              {" · "}
              {pattern.events.length} linked event{pattern.events.length === 1 ? "" : "s"}
            </p>

            {pattern.ownerName && (
              <p className="text-sm text-muted">
                Owner: {pattern.ownerName}
                {pattern.dueDate && ` · due ${formatDate(pattern.dueDate)}`}
              </p>
            )}
            {pattern.preventionAction && <p className="text-sm text-muted">Prevention action: {pattern.preventionAction}</p>}
            {pattern.measuredResultNote && (
              <p className="text-sm text-status-green">Result: {pattern.measuredResultNote}</p>
            )}

            {pattern.status === "IDENTIFIED" && <AssignPreventionForm patternId={pattern.id} />}
            {pattern.status === "ACTION_ASSIGNED" && <StartProgressButton patternId={pattern.id} />}
            {pattern.status === "IN_PROGRESS" && <MeasurePatternForm patternId={pattern.id} />}
            <LinkEventForm patternId={pattern.id} />
          </Card>
        ))}
        {sorted.length === 0 && (
          <Card>
            <p className="text-sm text-muted">No systemic patterns identified yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
