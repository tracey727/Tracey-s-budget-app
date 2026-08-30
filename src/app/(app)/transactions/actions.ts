"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createTransactionSchema = z.object({
  accountId: z.string().min(1),
  description: z.string().trim().min(1).max(120),
  amount: z.coerce.number(),
  date: z.coerce.date(),
  classification: z.enum(["ESSENTIAL", "WORTH_IT", "UNSURE", "WASTE"]).optional(),
  isTransfer: z.coerce.boolean().default(false),
});

export interface TransactionFormState {
  error?: string;
}

export async function createTransaction(
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const classificationRaw = formData.get("classification");

  const parsed = createTransactionSchema.safeParse({
    accountId: formData.get("accountId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    classification: classificationRaw ? classificationRaw : undefined,
    isTransfer: formData.get("isTransfer") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const account = await prisma.account.findFirst({
    where: { id: parsed.data.accountId, userId: session.user.id },
  });
  if (!account) return { error: "Account not found." };

  const { classification, ...rest } = parsed.data;

  await prisma.transaction.create({
    data: { ...rest, classification: rest.isTransfer ? undefined : classification, userId: session.user.id },
  });

  revalidatePath("/transactions");
  revalidatePath("/home");
  return {};
}

const reclassifySchema = z.object({
  transactionId: z.string().min(1),
  classification: z.enum(["ESSENTIAL", "WORTH_IT", "UNSURE", "WASTE"]),
});

export async function reclassifyTransaction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const parsed = reclassifySchema.safeParse({
    transactionId: formData.get("transactionId"),
    classification: formData.get("classification"),
  });
  if (!parsed.success) return;

  await prisma.transaction.updateMany({
    where: { id: parsed.data.transactionId, userId: session.user.id },
    data: { classification: parsed.data.classification },
  });

  revalidatePath("/transactions");
}
