"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  evaluateCapacityIdleAlerts,
  evaluatePatternUnassignedAlerts,
  evaluateRenewalDueAlerts,
  evaluateSavingsStalledAlerts,
  evaluateWasteRecurringAlerts,
  filterNewCandidates,
  type AlertCandidate,
} from "@/lib/engine";

export interface AlertFormState {
  error?: string;
}

const ruleSchema = z.object({
  name: z.string().trim().min(1).max(80),
  triggerType: z.enum(["WASTE_RECURRING", "CAPACITY_IDLE_HIGH", "COST_RENEWAL_DUE", "PATTERN_UNASSIGNED", "SAVINGS_STALLED"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  digestOnly: z.coerce.boolean().default(false),
  thresholdMinutes: z.coerce.number().min(0).optional(),
  thresholdDays: z.coerce.number().int().min(0).optional(),
});

export async function createAlertRule(_prev: AlertFormState, formData: FormData): Promise<AlertFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = ruleSchema.safeParse({
    name: formData.get("name"),
    triggerType: formData.get("triggerType"),
    severity: formData.get("severity"),
    digestOnly: formData.get("digestOnly") === "on",
    thresholdMinutes: formData.get("thresholdMinutes") || undefined,
    thresholdDays: formData.get("thresholdDays") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.alertRule.create({ data: { ...parsed.data, userId: session.user.id } });

  revalidatePath("/practice/alerts");
  return {};
}

export async function toggleAlertRule(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const ruleId = String(formData.get("ruleId") ?? "");
  const enabled = formData.get("enabled") === "true";

  await prisma.alertRule.updateMany({ where: { id: ruleId, userId: session.user.id }, data: { enabled: !enabled } });
  revalidatePath("/practice/alerts");
}

/**
 * Evaluates every enabled rule against current data and creates notifications
 * for newly-triggered conditions only — open (unread/acknowledged)
 * notifications suppress a repeat alert for the same condition.
 */
export async function runAlertCheck(): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const userId = session.user.id;
  const now = new Date();

  const [rules, openNotifications, wasteEvents, capacitySnapshots, recurringCharges, patterns, savingsCases] =
    await Promise.all([
      prisma.alertRule.findMany({ where: { userId, enabled: true } }),
      prisma.notification.findMany({ where: { userId, status: { in: ["UNREAD", "ACKNOWLEDGED"] } }, select: { dedupeKey: true } }),
      prisma.wasteEvent.findMany({ where: { userId } }),
      prisma.capacitySnapshot.findMany({ where: { userId } }),
      prisma.recurringCharge.findMany({ where: { userId } }),
      prisma.systemicPattern.findMany({ where: { userId } }),
      prisma.savingsCase.findMany({ where: { userId } }),
    ]);

  const openKeys = new Set(openNotifications.map((n) => n.dedupeKey));
  const candidates: Array<AlertCandidate & { digestOnly: boolean }> = [];

  for (const rule of rules) {
    let raw: AlertCandidate[] = [];
    if (rule.triggerType === "WASTE_RECURRING") {
      raw = evaluateWasteRecurringAlerts(
        wasteEvents.map((e) => ({
          id: e.id,
          description: e.description,
          isRecurring: e.isRecurring,
          status: e.status,
          estimatedMinutes: Number(e.estimatedMinutes),
        })),
        rule.thresholdMinutes != null ? Number(rule.thresholdMinutes) : 15,
      );
    } else if (rule.triggerType === "CAPACITY_IDLE_HIGH") {
      raw = evaluateCapacityIdleAlerts(
        capacitySnapshots.map((s) => ({
          id: s.id,
          label: s.label,
          availableUnits: Number(s.availableUnits),
          filledUnits: Number(s.filledUnits),
          waitingDemandUnits: Number(s.waitingDemandUnits),
          referralDemandUnits: Number(s.referralDemandUnits),
          cancellationUnits: Number(s.cancellationUnits),
          approvedNonWorkingUnits: Number(s.approvedNonWorkingUnits),
        })),
        rule.thresholdMinutes != null ? Number(rule.thresholdMinutes) : 10,
      );
    } else if (rule.triggerType === "COST_RENEWAL_DUE") {
      raw = evaluateRenewalDueAlerts(
        recurringCharges.map((c) => ({ id: c.id, name: c.name, renewalDate: c.renewalDate, reviewStatus: c.reviewStatus })),
        now,
        rule.thresholdDays ?? 30,
      );
    } else if (rule.triggerType === "PATTERN_UNASSIGNED") {
      raw = evaluatePatternUnassignedAlerts(
        patterns.map((p) => ({ id: p.id, title: p.title, status: p.status, ownerName: p.ownerName })),
      );
    } else if (rule.triggerType === "SAVINGS_STALLED") {
      raw = evaluateSavingsStalledAlerts(
        savingsCases.map((c) => ({ id: c.id, title: c.title, state: c.state, updatedAt: c.updatedAt })),
        now,
        rule.thresholdDays ?? 14,
      );
    }

    for (const candidate of raw) {
      candidates.push({ ...candidate, severity: rule.severity, digestOnly: rule.digestOnly });
    }
  }

  const fresh = filterNewCandidates(candidates, openKeys);
  // A single condition can legitimately appear once per enabled rule of that
  // trigger type; de-dupe again within this batch to avoid double-inserts.
  const seen = new Set<string>();
  const toCreate = fresh.filter((c) => (seen.has(c.dedupeKey) ? false : (seen.add(c.dedupeKey), true)));

  for (const candidate of toCreate) {
    const rule = rules.find((r) => r.triggerType === candidate.triggerType);
    await prisma.notification.upsert({
      where: { userId_dedupeKey: { userId, dedupeKey: candidate.dedupeKey } },
      create: {
        userId,
        alertRuleId: rule?.id,
        severity: candidate.severity,
        title: candidate.title,
        body: candidate.body,
        sourceType: candidate.sourceType as never,
        sourceId: candidate.sourceId,
        dedupeKey: candidate.dedupeKey,
      },
      update: {},
    });
  }

  revalidatePath("/practice/alerts");
  revalidatePath("/practice/dashboard");
}

export async function acknowledgeNotification(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const notificationId = String(formData.get("notificationId") ?? "");

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id, status: "UNREAD" },
    data: { status: "ACKNOWLEDGED", acknowledgedAt: new Date() },
  });
  revalidatePath("/practice/alerts");
}

export async function actionNotification(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const notificationId = String(formData.get("notificationId") ?? "");

  // Marking ACTIONED closes the condition — a fresh notification can be
  // raised again later if the same underlying condition recurs.
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { status: "ACTIONED" },
  });
  revalidatePath("/practice/alerts");
}
