"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAdvanceSavingsState } from "@/lib/engine";

export interface SavingsFormState {
  error?: string;
}

const createSchema = z.object({
  category: z.enum(["RECOVERED_REVENUE", "AVOIDED_COST", "RELEASED_STAFF_TIME"]),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  baselineValue: z.coerce.number().positive(),
  baselineUnit: z.enum(["MINUTES", "CURRENCY"]),
  calculationMethod: z.string().trim().min(1).max(300),
});

/** Manual entry point (sourceType MANUAL) — for savings not yet tied to a Phase 12/14 module row. */
export async function createManualSavingsCase(_prev: SavingsFormState, formData: FormData): Promise<SavingsFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = createSchema.safeParse({
    category: formData.get("category"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    baselineValue: formData.get("baselineValue"),
    baselineUnit: formData.get("baselineUnit"),
    calculationMethod: formData.get("calculationMethod"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.savingsCase.create({
    data: { ...parsed.data, sourceType: "MANUAL", userId: session.user.id },
  });

  revalidatePath("/practice/savings");
  revalidatePath("/practice/dashboard");
  return {};
}

async function loadOwnedCase(userId: string, caseId: string) {
  return prisma.savingsCase.findFirst({ where: { id: caseId, userId } });
}

const approveSchema = z.object({ caseId: z.string().min(1), approvedBy: z.string().trim().min(1).max(80) });

export async function approveSavingsCase(_prev: SavingsFormState, formData: FormData): Promise<SavingsFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = approveSchema.safeParse({ caseId: formData.get("caseId"), approvedBy: formData.get("approvedBy") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const savingsCase = await loadOwnedCase(session.user.id, parsed.data.caseId);
  if (!savingsCase) return { error: "Savings case not found." };

  const check = canAdvanceSavingsState("POTENTIAL", "APPROVED", {
    baselineValue: Number(savingsCase.baselineValue),
    postValue: savingsCase.postValue != null ? Number(savingsCase.postValue) : null,
    evidenceNote: savingsCase.evidenceNote,
    approvedBy: parsed.data.approvedBy,
    verifiedBy: savingsCase.verifiedBy,
  });
  if (savingsCase.state !== "POTENTIAL" || !check.allowed) {
    return { error: check.reason ?? "This case cannot be approved right now." };
  }

  await prisma.savingsCase.update({
    where: { id: savingsCase.id },
    data: { state: "APPROVED", approvedBy: parsed.data.approvedBy, approvedAt: new Date() },
  });

  revalidatePath("/practice/savings");
  revalidatePath("/practice/dashboard");
  return {};
}

export async function markImplemented(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const caseId = String(formData.get("caseId") ?? "");

  const savingsCase = await loadOwnedCase(session.user.id, caseId);
  if (!savingsCase || savingsCase.state !== "APPROVED") return;

  await prisma.savingsCase.update({
    where: { id: savingsCase.id },
    data: { state: "IMPLEMENTED", implementedAt: new Date() },
  });

  revalidatePath("/practice/savings");
}

const measureSchema = z.object({ caseId: z.string().min(1), postValue: z.coerce.number().min(0) });

export async function measureSavingsCase(_prev: SavingsFormState, formData: FormData): Promise<SavingsFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = measureSchema.safeParse({ caseId: formData.get("caseId"), postValue: formData.get("postValue") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const savingsCase = await loadOwnedCase(session.user.id, parsed.data.caseId);
  if (!savingsCase) return { error: "Savings case not found." };

  const check = canAdvanceSavingsState("IMPLEMENTED", "MEASURED", {
    baselineValue: Number(savingsCase.baselineValue),
    postValue: parsed.data.postValue,
    evidenceNote: savingsCase.evidenceNote,
    approvedBy: savingsCase.approvedBy,
    verifiedBy: savingsCase.verifiedBy,
  });
  if (savingsCase.state !== "IMPLEMENTED" || !check.allowed) {
    return { error: check.reason ?? "This case isn't ready to be measured." };
  }

  await prisma.savingsCase.update({
    where: { id: savingsCase.id },
    data: { postValue: parsed.data.postValue, state: "MEASURED", measuredAt: new Date() },
  });

  revalidatePath("/practice/savings");
  return {};
}

const verifySchema = z.object({
  caseId: z.string().min(1),
  evidenceNote: z.string().trim().min(1).max(500),
  verifiedBy: z.string().trim().min(1).max(80),
});

export async function verifySavingsCase(_prev: SavingsFormState, formData: FormData): Promise<SavingsFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = verifySchema.safeParse({
    caseId: formData.get("caseId"),
    evidenceNote: formData.get("evidenceNote"),
    verifiedBy: formData.get("verifiedBy"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const savingsCase = await loadOwnedCase(session.user.id, parsed.data.caseId);
  if (!savingsCase) return { error: "Savings case not found." };

  const check = canAdvanceSavingsState("MEASURED", "VERIFIED", {
    baselineValue: Number(savingsCase.baselineValue),
    postValue: savingsCase.postValue != null ? Number(savingsCase.postValue) : null,
    evidenceNote: parsed.data.evidenceNote,
    approvedBy: savingsCase.approvedBy,
    verifiedBy: parsed.data.verifiedBy,
  });
  if (savingsCase.state !== "MEASURED" || !check.allowed) {
    return { error: check.reason ?? "This case isn't ready to be verified." };
  }

  await prisma.savingsCase.update({
    where: { id: savingsCase.id },
    data: {
      evidenceNote: parsed.data.evidenceNote,
      verifiedBy: parsed.data.verifiedBy,
      state: "VERIFIED",
      verifiedAt: new Date(),
    },
  });

  // Denormalised reflection back onto the source waste event, so its own
  // status shows VERIFIED once the ledger has verified the linked case —
  // the source row is otherwise never touched by the ledger.
  if (savingsCase.sourceType === "WASTE_EVENT" && savingsCase.sourceId) {
    await prisma.wasteEvent.updateMany({
      where: { id: savingsCase.sourceId, userId: session.user.id, status: "MEASURED" },
      data: { status: "VERIFIED" },
    });
  }

  revalidatePath("/practice/savings");
  revalidatePath("/practice/waste");
  revalidatePath("/practice/dashboard");
  return {};
}
