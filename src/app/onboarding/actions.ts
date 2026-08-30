"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const frequencyEnum = z.enum(["WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]);

const onboardingSchema = z.object({
  payLabel: z.string().trim().min(1).max(60),
  payFrequency: frequencyEnum,
  nextPayDate: z.coerce.date(),
  incomeAmount: z.coerce.number().min(0),

  accountName: z.string().trim().min(1).max(60),
  accountType: z.enum(["PERSONAL", "BUSINESS_OPERATING"]),
  openingBalance: z.coerce.number(),
  openingBalanceDate: z.coerce.date(),

  billName: z.array(z.string().trim()).default([]),
  billAmount: z.array(z.string()).default([]),
  billDueDate: z.array(z.string()).default([]),
  billFrequency: z.array(z.string()).default([]),
  billFundingMethod: z.array(z.string()).default([]),
});

export interface OnboardingState {
  error?: string;
}

export async function completeOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in." };

  const raw = {
    payLabel: formData.get("payLabel"),
    payFrequency: formData.get("payFrequency"),
    nextPayDate: formData.get("nextPayDate"),
    incomeAmount: formData.get("incomeAmount"),
    accountName: formData.get("accountName"),
    accountType: formData.get("accountType"),
    openingBalance: formData.get("openingBalance"),
    openingBalanceDate: formData.get("openingBalanceDate"),
    billName: formData.getAll("billName"),
    billAmount: formData.getAll("billAmount"),
    billDueDate: formData.getAll("billDueDate"),
    billFrequency: formData.getAll("billFrequency"),
    billFundingMethod: formData.getAll("billFundingMethod"),
  };

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const data = parsed.data;
  const userId = session.user.id;

  const bills = data.billName
    .map((name, i) => ({
      name: name.trim(),
      amount: Number(data.billAmount[i]),
      dueDate: data.billDueDate[i] ? new Date(data.billDueDate[i]) : null,
      frequency: frequencyEnum.safeParse(data.billFrequency[i]).success
        ? (data.billFrequency[i] as z.infer<typeof frequencyEnum>)
        : "MONTHLY",
      fundingMethod: data.billFundingMethod[i] === "FULL_AMOUNT" ? "FULL_AMOUNT" : "AVERAGED",
    }))
    .filter((b) => b.name && Number.isFinite(b.amount) && b.amount > 0 && b.dueDate);

  await prisma.$transaction(async (tx) => {
    await tx.payCycle.create({
      data: {
        userId,
        label: data.payLabel,
        frequency: data.payFrequency,
        nextPayDate: data.nextPayDate,
        incomeAmount: data.incomeAmount,
      },
    });

    const account = await tx.account.create({
      data: {
        userId,
        name: data.accountName,
        type: data.accountType,
        openingBalance: data.openingBalance,
        openingBalanceDate: data.openingBalanceDate,
        currentBalance: data.openingBalance,
      },
    });

    if (bills.length > 0) {
      await tx.bill.createMany({
        data: bills.map((b) => ({
          userId,
          accountId: account.id,
          name: b.name,
          amount: b.amount,
          dueDate: b.dueDate as Date,
          frequency: b.frequency,
          fundingMethod: b.fundingMethod as "AVERAGED" | "FULL_AMOUNT",
        })),
      });
    }

    await tx.user.update({ where: { id: userId }, data: { onboardingComplete: true } });

    await tx.auditLog.create({
      data: {
        userId,
        action: "ONBOARDING_COMPLETED",
        entityType: "User",
        entityId: userId,
        afterJson: { accountId: account.id, billCount: bills.length },
      },
    });
  });

  redirect("/home");
}
