"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createGoalSchema = z.object({
  name: z.string().trim().min(1).max(80),
  targetAmount: z.coerce.number().positive(),
  targetDate: z.coerce.date().optional(),
  contributionPlan: z.coerce.number().optional(),
});

export interface GoalFormState {
  error?: string;
}

export async function createGoal(_prev: GoalFormState, formData: FormData): Promise<GoalFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const targetDateRaw = formData.get("targetDate");
  const contributionRaw = formData.get("contributionPlan");

  const parsed = createGoalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    targetDate: targetDateRaw ? targetDateRaw : undefined,
    contributionPlan: contributionRaw ? contributionRaw : undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.savingsGoal.create({ data: { ...parsed.data, userId: session.user.id } });

  revalidatePath("/goals");
  revalidatePath("/home");
  return {};
}

const updateVerifiedSchema = z.object({
  goalId: z.string().min(1),
  verifiedAmount: z.coerce.number().min(0),
});

export async function updateVerifiedAmount(_prev: GoalFormState, formData: FormData): Promise<GoalFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = updateVerifiedSchema.safeParse({
    goalId: formData.get("goalId"),
    verifiedAmount: formData.get("verifiedAmount"),
  });
  if (!parsed.success) return { error: "Invalid amount." };

  await prisma.savingsGoal.updateMany({
    where: { id: parsed.data.goalId, userId: session.user.id },
    data: { verifiedAmount: parsed.data.verifiedAmount },
  });

  revalidatePath("/goals");
  return {};
}
