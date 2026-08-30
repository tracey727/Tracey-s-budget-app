"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createBillSchema = z.object({
  accountId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  amount: z.coerce.number().positive(),
  dueDate: z.coerce.date(),
  frequency: z.enum(["WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]),
  fundingMethod: z.enum(["AVERAGED", "FULL_AMOUNT"]),
});

export interface BillFormState {
  error?: string;
}

export async function createBill(_prev: BillFormState, formData: FormData): Promise<BillFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = createBillSchema.safeParse({
    accountId: formData.get("accountId"),
    name: formData.get("name"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    frequency: formData.get("frequency"),
    fundingMethod: formData.get("fundingMethod"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const account = await prisma.account.findFirst({
    where: { id: parsed.data.accountId, userId: session.user.id },
  });
  if (!account) return { error: "Account not found." };

  await prisma.bill.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  revalidatePath("/bills");
  revalidatePath("/home");
  return {};
}

export async function archiveBill(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const billId = String(formData.get("billId") ?? "");

  await prisma.bill.updateMany({
    where: { id: billId, userId: session.user.id },
    data: { archived: true },
  });

  revalidatePath("/bills");
  revalidatePath("/home");
}

const markPaidSchema = z.object({
  billId: z.string().min(1),
  nextDueDate: z.coerce.date(),
});

/** Rolls a bill forward to its next due date once paid, without touching historical records. */
export async function markBillPaid(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const parsed = markPaidSchema.safeParse({
    billId: formData.get("billId"),
    nextDueDate: formData.get("nextDueDate"),
  });
  if (!parsed.success) return;

  await prisma.bill.updateMany({
    where: { id: parsed.data.billId, userId: session.user.id },
    data: { dueDate: parsed.data.nextDueDate },
  });

  revalidatePath("/bills");
  revalidatePath("/home");
}
