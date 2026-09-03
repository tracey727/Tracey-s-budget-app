"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAlreadyLinked } from "@/lib/engine";

export interface PatternFormState {
  error?: string;
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  rootCause: z.string().trim().max(300).optional(),
  estimatedImpactMinutes: z.coerce.number().min(0).optional(),
  estimatedImpactCurrency: z.coerce.number().min(0).optional(),
});

export async function createPattern(_prev: PatternFormState, formData: FormData): Promise<PatternFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    rootCause: formData.get("rootCause") || undefined,
    estimatedImpactMinutes: formData.get("estimatedImpactMinutes") || undefined,
    estimatedImpactCurrency: formData.get("estimatedImpactCurrency") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.systemicPattern.create({ data: { ...parsed.data, userId: session.user.id } });

  revalidatePath("/practice/patterns");
  revalidatePath("/practice/dashboard");
  return {};
}

const assignSchema = z.object({
  patternId: z.string().min(1),
  ownerName: z.string().trim().min(1).max(80),
  dueDate: z.coerce.date(),
  preventionAction: z.string().trim().min(1).max(300),
});

export async function assignPreventionAction(_prev: PatternFormState, formData: FormData): Promise<PatternFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = assignSchema.safeParse({
    patternId: formData.get("patternId"),
    ownerName: formData.get("ownerName"),
    dueDate: formData.get("dueDate"),
    preventionAction: formData.get("preventionAction"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const pattern = await prisma.systemicPattern.findFirst({
    where: { id: parsed.data.patternId, userId: session.user.id },
  });
  if (!pattern || pattern.status !== "IDENTIFIED") return { error: "This pattern already has an action assigned." };

  await prisma.systemicPattern.update({
    where: { id: pattern.id },
    data: {
      ownerName: parsed.data.ownerName,
      dueDate: parsed.data.dueDate,
      preventionAction: parsed.data.preventionAction,
      status: "ACTION_ASSIGNED",
    },
  });

  revalidatePath("/practice/patterns");
  return {};
}

export async function startPatternProgress(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const patternId = String(formData.get("patternId") ?? "");

  const pattern = await prisma.systemicPattern.findFirst({ where: { id: patternId, userId: session.user.id } });
  if (!pattern || pattern.status !== "ACTION_ASSIGNED") return;

  await prisma.systemicPattern.update({ where: { id: pattern.id }, data: { status: "IN_PROGRESS" } });
  revalidatePath("/practice/patterns");
}

const measureSchema = z.object({
  patternId: z.string().min(1),
  measuredResultNote: z.string().trim().min(1).max(500),
});

export async function measurePattern(_prev: PatternFormState, formData: FormData): Promise<PatternFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = measureSchema.safeParse({
    patternId: formData.get("patternId"),
    measuredResultNote: formData.get("measuredResultNote"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const pattern = await prisma.systemicPattern.findFirst({
    where: { id: parsed.data.patternId, userId: session.user.id },
  });
  if (!pattern || pattern.status !== "IN_PROGRESS") return { error: "This pattern isn't in progress yet." };

  await prisma.systemicPattern.update({
    where: { id: pattern.id },
    data: { measuredResultNote: parsed.data.measuredResultNote, status: "MEASURED" },
  });

  revalidatePath("/practice/patterns");
  return {};
}

const linkSchema = z.object({
  patternId: z.string().min(1),
  sourceType: z.enum(["WASTE_EVENT", "RECURRING_COST", "CAPACITY_SNAPSHOT", "MANUAL"]),
  sourceId: z.string().trim().min(1).max(60),
  note: z.string().trim().max(200).optional(),
});

/** Append-only: links an event into a pattern without ever mutating the linked event's own row. */
export async function linkEventToPattern(_prev: PatternFormState, formData: FormData): Promise<PatternFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = linkSchema.safeParse({
    patternId: formData.get("patternId"),
    sourceType: formData.get("sourceType"),
    sourceId: formData.get("sourceId"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const pattern = await prisma.systemicPattern.findFirst({
    where: { id: parsed.data.patternId, userId: session.user.id },
    include: { events: true },
  });
  if (!pattern) return { error: "Pattern not found." };

  if (isAlreadyLinked(pattern.events, { sourceType: parsed.data.sourceType, sourceId: parsed.data.sourceId })) {
    return { error: "That event is already linked to this pattern." };
  }

  await prisma.patternEvent.create({
    data: {
      patternId: pattern.id,
      sourceType: parsed.data.sourceType,
      sourceId: parsed.data.sourceId,
      note: parsed.data.note,
    },
  });

  revalidatePath("/practice/patterns");
  return {};
}
