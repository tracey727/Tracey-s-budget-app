"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAdvanceWasteStatus, isDuplicateSourceLink } from "@/lib/engine";

export interface WasteFormState {
  error?: string;
}

const createSchema = z.object({
  category: z.enum([
    "DUPLICATE_WORK",
    "REWORK",
    "SEARCHING",
    "WAITING",
    "MANUAL_ENTRY",
    "WRONG_ROLE_WORK",
    "UNNECESSARY_APPROVAL",
  ]),
  description: z.string().trim().min(1).max(200),
  estimatedMinutes: z.coerce.number().positive(),
  isRecurring: z.coerce.boolean().default(false),
  recurrenceNote: z.string().trim().max(200).optional(),
});

export async function logWasteEvent(_prev: WasteFormState, formData: FormData): Promise<WasteFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = createSchema.safeParse({
    category: formData.get("category"),
    description: formData.get("description"),
    estimatedMinutes: formData.get("estimatedMinutes"),
    isRecurring: formData.get("isRecurring") === "on",
    recurrenceNote: formData.get("recurrenceNote") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.wasteEvent.create({ data: { ...parsed.data, userId: session.user.id } });

  revalidatePath("/practice/waste");
  revalidatePath("/practice/dashboard");
  return {};
}

const rootCauseSchema = z.object({
  wasteEventId: z.string().min(1),
  rootCause: z.string().trim().min(1).max(300),
});

/** Freezes the baseline at the current estimatedMinutes — later edits never rewrite the before/after comparison. */
export async function confirmRootCause(_prev: WasteFormState, formData: FormData): Promise<WasteFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = rootCauseSchema.safeParse({
    wasteEventId: formData.get("wasteEventId"),
    rootCause: formData.get("rootCause"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const event = await prisma.wasteEvent.findFirst({
    where: { id: parsed.data.wasteEventId, userId: session.user.id },
  });
  if (!event) return { error: "Waste event not found." };

  const check = canAdvanceWasteStatus("LOGGED", "ROOT_CAUSE_CONFIRMED", {
    baselineMinutes: event.baselineMinutes ? Number(event.baselineMinutes) : null,
    postMinutes: event.postMinutes ? Number(event.postMinutes) : null,
  });
  if (event.status !== "LOGGED" || !check.allowed) {
    return { error: check.reason ?? "This event isn't ready for a root-cause review." };
  }

  await prisma.wasteEvent.update({
    where: { id: event.id },
    data: {
      rootCause: parsed.data.rootCause,
      baselineMinutes: event.estimatedMinutes,
      status: "ROOT_CAUSE_CONFIRMED",
    },
  });

  revalidatePath("/practice/waste");
  return {};
}

const interventionSchema = z.object({
  wasteEventId: z.string().min(1),
  interventionDescription: z.string().trim().min(1).max(300),
});

export async function planIntervention(_prev: WasteFormState, formData: FormData): Promise<WasteFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = interventionSchema.safeParse({
    wasteEventId: formData.get("wasteEventId"),
    interventionDescription: formData.get("interventionDescription"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const event = await prisma.wasteEvent.findFirst({
    where: { id: parsed.data.wasteEventId, userId: session.user.id },
  });
  if (!event) return { error: "Waste event not found." };

  const check = canAdvanceWasteStatus("ROOT_CAUSE_CONFIRMED", "INTERVENTION_PLANNED", {
    baselineMinutes: event.baselineMinutes ? Number(event.baselineMinutes) : null,
    postMinutes: event.postMinutes ? Number(event.postMinutes) : null,
  });
  if (event.status !== "ROOT_CAUSE_CONFIRMED" || !check.allowed) {
    return { error: check.reason ?? "This event isn't ready for an intervention plan." };
  }

  await prisma.wasteEvent.update({
    where: { id: event.id },
    data: { interventionDescription: parsed.data.interventionDescription, status: "INTERVENTION_PLANNED" },
  });

  revalidatePath("/practice/waste");
  return {};
}

export async function startIntervention(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const wasteEventId = String(formData.get("wasteEventId") ?? "");

  const event = await prisma.wasteEvent.findFirst({ where: { id: wasteEventId, userId: session.user.id } });
  if (!event || event.status !== "INTERVENTION_PLANNED") return;

  await prisma.wasteEvent.update({
    where: { id: event.id },
    data: { status: "INTERVENTION_ACTIVE", interventionStartedAt: new Date() },
  });

  revalidatePath("/practice/waste");
}

const measureSchema = z.object({
  wasteEventId: z.string().min(1),
  postMinutes: z.coerce.number().min(0),
});

export async function recordMeasurement(_prev: WasteFormState, formData: FormData): Promise<WasteFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = measureSchema.safeParse({
    wasteEventId: formData.get("wasteEventId"),
    postMinutes: formData.get("postMinutes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const event = await prisma.wasteEvent.findFirst({
    where: { id: parsed.data.wasteEventId, userId: session.user.id },
  });
  if (!event) return { error: "Waste event not found." };
  if (event.status !== "INTERVENTION_ACTIVE") return { error: "This event isn't ready to be measured." };

  await prisma.wasteEvent.update({
    where: { id: event.id },
    data: { postMinutes: parsed.data.postMinutes, status: "MEASURED" },
  });

  revalidatePath("/practice/waste");
  return {};
}

/** Phase 16 handoff: creates the linked, Potential-state savings case that the ledger then approves/measures/verifies. */
export async function createSavingsCaseFromWaste(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const wasteEventId = String(formData.get("wasteEventId") ?? "");

  const event = await prisma.wasteEvent.findFirst({ where: { id: wasteEventId, userId: session.user.id } });
  if (!event || event.status !== "MEASURED" || event.baselineMinutes == null || event.postMinutes == null) return;

  const existing = await prisma.savingsCase.findMany({
    where: { userId: session.user.id, sourceType: "WASTE_EVENT" },
    select: { sourceId: true },
  });
  if (isDuplicateSourceLink(existing.map((e) => ({ sourceType: "WASTE_EVENT", sourceId: e.sourceId })), { sourceType: "WASTE_EVENT", sourceId: event.id })) {
    return;
  }

  await prisma.savingsCase.create({
    data: {
      userId: session.user.id,
      category: "RELEASED_STAFF_TIME",
      title: `Staff time released: ${event.description}`,
      description: event.rootCause ? `Root cause: ${event.rootCause}` : undefined,
      sourceType: "WASTE_EVENT",
      sourceId: event.id,
      baselineValue: event.baselineMinutes,
      baselineUnit: "MINUTES",
      postValue: event.postMinutes,
      calculationMethod: "Baseline minutes recorded at root-cause confirmation minus post-intervention minutes (Phase 12).",
    },
  });

  revalidatePath("/practice/waste");
  revalidatePath("/practice/savings");
  revalidatePath("/practice/dashboard");
}
