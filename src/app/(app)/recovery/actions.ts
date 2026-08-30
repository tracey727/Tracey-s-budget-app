"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const startSchema = z.object({
  shortfallAmount: z.coerce.number().min(0),
  targetAmount: z.coerce.number().min(0),
  notes: z.string().trim().max(500).optional(),
});

export interface RecoveryFormState {
  error?: string;
}

export async function startRecovery(_prev: RecoveryFormState, formData: FormData): Promise<RecoveryFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = startSchema.safeParse({
    shortfallAmount: formData.get("shortfallAmount"),
    targetAmount: formData.get("targetAmount"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.recoveryState.create({ data: { ...parsed.data, userId: session.user.id, active: true } });

  revalidatePath("/recovery");
  revalidatePath("/home");
  return {};
}

const progressSchema = z.object({
  recoveryId: z.string().min(1),
  progressAmount: z.coerce.number().min(0),
});

export async function updateProgress(_prev: RecoveryFormState, formData: FormData): Promise<RecoveryFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = progressSchema.safeParse({
    recoveryId: formData.get("recoveryId"),
    progressAmount: formData.get("progressAmount"),
  });
  if (!parsed.success) return { error: "Invalid amount." };

  await prisma.recoveryState.updateMany({
    where: { id: parsed.data.recoveryId, userId: session.user.id },
    data: { progressAmount: parsed.data.progressAmount },
  });

  revalidatePath("/recovery");
  revalidatePath("/home");
  return {};
}

export async function resolveRecovery(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const recoveryId = String(formData.get("recoveryId") ?? "");

  await prisma.recoveryState.updateMany({
    where: { id: recoveryId, userId: session.user.id },
    data: { active: false, resolvedAt: new Date() },
  });

  revalidatePath("/recovery");
  revalidatePath("/home");
}
