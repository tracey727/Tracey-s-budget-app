"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createAccountSchema = z.object({
  name: z.string().trim().min(1).max(60),
  type: z.enum(["PERSONAL", "BUSINESS_OPERATING"]),
  openingBalance: z.coerce.number(),
  openingBalanceDate: z.coerce.date(),
});

export interface AccountFormState {
  error?: string;
}

export async function createAccount(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = createAccountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    openingBalance: formData.get("openingBalance"),
    openingBalanceDate: formData.get("openingBalanceDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { name, type, openingBalance, openingBalanceDate } = parsed.data;

  await prisma.account.create({
    data: {
      userId: session.user.id,
      name,
      type,
      openingBalance,
      openingBalanceDate,
      currentBalance: openingBalance,
    },
  });

  revalidatePath("/accounts");
  revalidatePath("/home");
  return {};
}

const updateBalanceSchema = z.object({
  accountId: z.string().min(1),
  currentBalance: z.coerce.number(),
});

export async function updateCurrentBalance(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = updateBalanceSchema.safeParse({
    accountId: formData.get("accountId"),
    currentBalance: formData.get("currentBalance"),
  });
  if (!parsed.success) return { error: "Invalid balance." };

  const account = await prisma.account.findFirst({
    where: { id: parsed.data.accountId, userId: session.user.id },
  });
  if (!account) return { error: "Account not found." };

  await prisma.account.update({
    where: { id: account.id },
    data: { currentBalance: parsed.data.currentBalance },
  });

  revalidatePath("/accounts");
  revalidatePath("/home");
  return {};
}

export async function archiveAccount(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const accountId = String(formData.get("accountId") ?? "");

  await prisma.account.updateMany({
    where: { id: accountId, userId: session.user.id },
    data: { archived: true },
  });

  revalidatePath("/accounts");
  revalidatePath("/home");
}
