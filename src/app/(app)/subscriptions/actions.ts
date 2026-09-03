"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { annualisedSaving, isDuplicateSourceLink } from "@/lib/engine";

const createChargeSchema = z.object({
  name: z.string().trim().min(1).max(80),
  amount: z.coerce.number().positive(),
  frequency: z.enum(["WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]),
  isBusinessCost: z.coerce.boolean().default(false),
  owner: z.string().trim().max(80).optional(),
  purpose: z.string().trim().max(200).optional(),
  renewalDate: z.coerce.date().optional(),
  isDuplicate: z.coerce.boolean().default(false),
});

export interface ChargeFormState {
  error?: string;
}

export async function createRecurringCharge(_prev: ChargeFormState, formData: FormData): Promise<ChargeFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = createChargeSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency"),
    isBusinessCost: formData.get("isBusinessCost") === "on",
    owner: formData.get("owner") || undefined,
    purpose: formData.get("purpose") || undefined,
    renewalDate: formData.get("renewalDate") || undefined,
    isDuplicate: formData.get("isDuplicate") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.recurringCharge.create({ data: { ...parsed.data, userId: session.user.id } });

  revalidatePath("/subscriptions");
  revalidatePath("/home");
  return {};
}

const reviewSchema = z.object({
  chargeId: z.string().min(1),
  reviewStatus: z.enum(["KEEP", "RECONSIDER", "CANCELLED"]),
});

export async function reviewRecurringCharge(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const parsed = reviewSchema.safeParse({
    chargeId: formData.get("chargeId"),
    reviewStatus: formData.get("reviewStatus"),
  });
  if (!parsed.success) return;

  await prisma.recurringCharge.updateMany({
    where: { id: parsed.data.chargeId, userId: session.user.id },
    data: { reviewStatus: parsed.data.reviewStatus },
  });

  revalidatePath("/subscriptions");
  revalidatePath("/home");
}

/**
 * Phase 14 — Recurring Cost & Supplier Waste Review (M08). Records the
 * keep/cancel/renegotiate decision, snapshots the pre-decision amount so
 * `previousAmount - amount` always reproduces the saving even after later
 * edits, and hands the case to the Phase 16 ledger for approval/verification
 * rather than counting it as saved immediately (business rule #6).
 */
const decisionSchema = z.object({
  chargeId: z.string().min(1),
  decisionNote: z.string().trim().min(1).max(300),
  newAmount: z.coerce.number().min(0),
});

export interface CostDecisionFormState {
  error?: string;
}

export async function recordCostDecision(_prev: CostDecisionFormState, formData: FormData): Promise<CostDecisionFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = decisionSchema.safeParse({
    chargeId: formData.get("chargeId"),
    decisionNote: formData.get("decisionNote"),
    newAmount: formData.get("newAmount"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const charge = await prisma.recurringCharge.findFirst({
    where: { id: parsed.data.chargeId, userId: session.user.id },
  });
  if (!charge) return { error: "Recurring cost not found." };

  const previousAmount = Number(charge.amount);
  const saving = annualisedSaving(previousAmount, parsed.data.newAmount, charge.frequency);

  await prisma.recurringCharge.update({
    where: { id: charge.id },
    data: {
      previousAmount,
      amount: parsed.data.newAmount,
      decisionNote: parsed.data.decisionNote,
      decidedAt: new Date(),
      reviewStatus: parsed.data.newAmount <= 0 ? "CANCELLED" : "RECONSIDER",
    },
  });

  if (saving > 0) {
    const existing = await prisma.savingsCase.findMany({
      where: { userId: session.user.id, sourceType: "RECURRING_COST" },
      select: { sourceId: true },
    });
    const alreadyLinked = isDuplicateSourceLink(
      existing.map((e) => ({ sourceType: "RECURRING_COST", sourceId: e.sourceId })),
      { sourceType: "RECURRING_COST", sourceId: charge.id },
    );
    if (!alreadyLinked) {
      await prisma.savingsCase.create({
        data: {
          userId: session.user.id,
          category: "AVOIDED_COST",
          title: `Recurring cost reduced: ${charge.name}`,
          description: parsed.data.decisionNote,
          sourceType: "RECURRING_COST",
          sourceId: charge.id,
          baselineValue: previousAmount,
          baselineUnit: "CURRENCY",
          postValue: parsed.data.newAmount,
          calculationMethod: "Old recurring cost minus new recurring cost, annualised (Phase 14).",
        },
      });
    }
  }

  revalidatePath("/subscriptions");
  revalidatePath("/practice/savings");
  revalidatePath("/practice/dashboard");
  return {};
}
