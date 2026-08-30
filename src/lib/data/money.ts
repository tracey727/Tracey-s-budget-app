import { prisma } from "@/lib/prisma";
import {
  calculateSafeToSpend,
  determineMoneyStatus,
  determineBillStatus,
  protectedReserveForBill,
  type EngineAccount,
  type EngineBill,
} from "@/lib/engine";

const DEFAULT_PAY_PERIOD_DAYS = 14;

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

export async function getPayPeriodDays(userId: string): Promise<number> {
  const payCycle = await prisma.payCycle.findFirst({
    where: { userId },
    orderBy: { nextPayDate: "asc" },
  });
  if (!payCycle) return DEFAULT_PAY_PERIOD_DAYS;
  const days: Record<string, number> = {
    WEEKLY: 7,
    FORTNIGHTLY: 14,
    MONTHLY: 30,
    QUARTERLY: 91,
    ANNUALLY: 365,
  };
  return days[payCycle.frequency] ?? DEFAULT_PAY_PERIOD_DAYS;
}

export async function getMoneyPosition(userId: string) {
  const [accounts, bills, recoveryState] = await Promise.all([
    prisma.account.findMany({ where: { userId, archived: false } }),
    prisma.bill.findMany({ where: { userId, archived: false } }),
    prisma.recoveryState.findFirst({ where: { userId, active: true } }),
  ]);

  const payPeriodDays = await getPayPeriodDays(userId);
  const referenceDate = new Date();

  const engineAccounts: EngineAccount[] = accounts.map((a) => ({
    id: a.id,
    type: a.type,
    currentBalance: toNumber(a.currentBalance),
    protectedAmount: toNumber(a.protectedAmount),
    archived: a.archived,
  }));

  const engineBills: EngineBill[] = bills.map((b) => ({
    id: b.id,
    accountId: b.accountId,
    amount: toNumber(b.amount),
    dueDate: b.dueDate,
    frequency: b.frequency,
    fundingMethod: b.fundingMethod,
    archived: b.archived,
  }));

  const breakdown = calculateSafeToSpend({
    accounts: engineAccounts,
    bills: engineBills,
    payPeriodDays,
    referenceDate,
  });

  const engineBillById = new Map(engineBills.map((b) => [b.id, b]));

  const billStatuses = bills.map((bill) => {
    const engineBill = engineBillById.get(bill.id)!;
    const reserved =
      breakdown.billReserves.find((r) => r.billId === bill.id)?.reserved ??
      protectedReserveForBill(engineBill, payPeriodDays, referenceDate);
    return {
      bill,
      reserved,
      status: determineBillStatus(engineBill, reserved, payPeriodDays, referenceDate),
    };
  });

  const atRiskBillAmount = billStatuses
    .filter((b) => b.status === "AT_RISK" || b.status === "OVERDUE")
    .reduce((sum, b) => sum + toNumber(b.bill.amount), 0);

  const statusResult = determineMoneyStatus({
    safeToSpend: breakdown.safeToSpend,
    atRiskBillAmount,
    recoveryActive: Boolean(recoveryState),
  });

  return {
    accounts,
    bills,
    billStatuses,
    breakdown,
    statusResult,
    recoveryState,
    payPeriodDays,
    referenceDate,
  };
}
