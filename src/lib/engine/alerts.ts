import type { AlertSeverity, AlertTrigger } from "./types";
import { classifyCapacity } from "./capacity";
import type { EngineCapacitySnapshot } from "./types";
import { isRenewalApproaching } from "./recurringCost";

/**
 * Phase 18 — Alerts, Notifications & Accountability.
 *
 * Every alert candidate carries a stable `dedupeKey` derived from its
 * trigger type and source, so the same underlying condition is never
 * alerted on twice while it remains open (GREEN GATE: "escalate correctly
 * and remain auditable" / "test duplicate alert suppression").
 */
export interface AlertCandidate {
  triggerType: AlertTrigger;
  severity: AlertSeverity;
  title: string;
  body: string;
  sourceType: string;
  sourceId: string;
  dedupeKey: string;
}

export function dedupeKeyFor(triggerType: AlertTrigger, sourceId: string): string {
  return `${triggerType}:${sourceId}`;
}

/** Only raise a candidate if its condition isn't already covered by an open (unread/acknowledged) notification. */
export function filterNewCandidates(
  candidates: AlertCandidate[],
  existingActiveDedupeKeys: Set<string>,
): AlertCandidate[] {
  return candidates.filter((c) => !existingActiveDedupeKeys.has(c.dedupeKey));
}

export function evaluateWasteRecurringAlerts(
  events: Array<{ id: string; description: string; isRecurring: boolean; status: string; estimatedMinutes: number }>,
  thresholdMinutes: number,
): AlertCandidate[] {
  return events
    .filter((e) => e.isRecurring && e.status === "LOGGED" && e.estimatedMinutes >= thresholdMinutes)
    .map((e) => ({
      triggerType: "WASTE_RECURRING" as const,
      severity: "MEDIUM" as const,
      title: "Recurring waste needs a root-cause review",
      body: `"${e.description}" is recurring and costs ~${e.estimatedMinutes} min each time.`,
      sourceType: "WASTE_EVENT",
      sourceId: e.id,
      dedupeKey: dedupeKeyFor("WASTE_RECURRING", e.id),
    }));
}

export function evaluateCapacityIdleAlerts(
  snapshots: Array<EngineCapacitySnapshot & { label: string }>,
  thresholdUnits: number,
): AlertCandidate[] {
  return snapshots
    .filter((s) => classifyCapacity(s).avoidableIdleUnits >= thresholdUnits)
    .map((s) => {
      const breakdown = classifyCapacity(s);
      return {
        triggerType: "CAPACITY_IDLE_HIGH" as const,
        severity: "HIGH" as const,
        title: `Avoidable idle capacity in "${s.label}"`,
        body: `${breakdown.avoidableIdleUnits} units avoidable idle (${breakdown.recoverableUnits} recoverable against current demand).`,
        sourceType: "CAPACITY_SNAPSHOT",
        sourceId: s.id,
        dedupeKey: dedupeKeyFor("CAPACITY_IDLE_HIGH", s.id),
      };
    });
}

export function evaluateRenewalDueAlerts(
  charges: Array<{ id: string; name: string; renewalDate: Date | null; reviewStatus: string }>,
  referenceDate: Date,
  withinDays: number,
): AlertCandidate[] {
  return charges
    .filter((c) => c.reviewStatus !== "CANCELLED" && isRenewalApproaching(c.renewalDate, referenceDate, withinDays))
    .map((c) => ({
      triggerType: "COST_RENEWAL_DUE" as const,
      severity: "LOW" as const,
      title: `Renewal approaching: ${c.name}`,
      body: `${c.name} renews within ${withinDays} days and has not been reviewed as CANCELLED.`,
      sourceType: "RECURRING_COST",
      sourceId: c.id,
      dedupeKey: dedupeKeyFor("COST_RENEWAL_DUE", c.id),
    }));
}

export function evaluatePatternUnassignedAlerts(
  patterns: Array<{ id: string; title: string; status: string; ownerName: string | null }>,
): AlertCandidate[] {
  return patterns
    .filter((p) => p.status === "IDENTIFIED" && !p.ownerName)
    .map((p) => ({
      triggerType: "PATTERN_UNASSIGNED" as const,
      severity: "MEDIUM" as const,
      title: `Pattern needs an owner: ${p.title}`,
      body: `"${p.title}" has been identified but has no prevention-action owner yet.`,
      sourceType: "SYSTEMIC_PATTERN",
      sourceId: p.id,
      dedupeKey: dedupeKeyFor("PATTERN_UNASSIGNED", p.id),
    }));
}

export function evaluateSavingsStalledAlerts(
  cases: Array<{ id: string; title: string; state: string; updatedAt: Date }>,
  referenceDate: Date,
  staleDays: number,
): AlertCandidate[] {
  const msPerDay = 1000 * 60 * 60 * 24;
  return cases
    .filter((c) => {
      if (c.state !== "APPROVED" && c.state !== "IMPLEMENTED") return false;
      const daysSinceUpdate = (referenceDate.getTime() - c.updatedAt.getTime()) / msPerDay;
      return daysSinceUpdate >= staleDays;
    })
    .map((c) => ({
      triggerType: "SAVINGS_STALLED" as const,
      severity: "MEDIUM" as const,
      title: `Savings case stalled: ${c.title}`,
      body: `"${c.title}" has been in ${c.state} for ${staleDays}+ days without progress.`,
      sourceType: "MANUAL",
      sourceId: c.id,
      dedupeKey: dedupeKeyFor("SAVINGS_STALLED", c.id),
    }));
}
