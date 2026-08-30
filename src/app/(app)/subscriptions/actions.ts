"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createChargeSchema = z.object({
  name: z.string().trim().min(1).max(80),
  amount: z.coerce.number().positive(),
  frequency: z.enum(["WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]),
  isBusinessCost: z.coerce.boolean().default(false),
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
