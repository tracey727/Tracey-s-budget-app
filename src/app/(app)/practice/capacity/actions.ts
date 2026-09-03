"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface CapacityFormState {
  error?: string;
}

const createSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    availableUnits: z.coerce.number().min(0),
    filledUnits: z.coerce.number().min(0),
    waitingDemandUnits: z.coerce.number().min(0).default(0),
    referralDemandUnits: z.coerce.number().min(0).default(0),
    cancellationUnits: z.coerce.number().min(0).default(0),
    approvedNonWorkingUnits: z.coerce.number().min(0).default(0),
    notes: z.string().trim().max(300).optional(),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "Period end must be on or after period start.",
    path: ["periodEnd"],
  });

export async function createCapacitySnapshot(_prev: CapacityFormState, formData: FormData): Promise<CapacityFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = createSchema.safeParse({
    label: formData.get("label"),
    periodStart: formData.get("periodStart"),
    periodEnd: formData.get("periodEnd"),
    availableUnits: formData.get("availableUnits"),
    filledUnits: formData.get("filledUnits"),
    waitingDemandUnits: formData.get("waitingDemandUnits") || 0,
    referralDemandUnits: formData.get("referralDemandUnits") || 0,
    cancellationUnits: formData.get("cancellationUnits") || 0,
    approvedNonWorkingUnits: formData.get("approvedNonWorkingUnits") || 0,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.capacitySnapshot.create({ data: { ...parsed.data, userId: session.user.id } });

  revalidatePath("/practice/capacity");
  revalidatePath("/practice/dashboard");
  return {};
}
