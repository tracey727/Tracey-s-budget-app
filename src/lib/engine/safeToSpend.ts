import type { EngineAccount, EngineBill } from "./types";
import { protectedReserveForBill } from "./bills";
import { round2 } from "./frequency";

export interface SafeToSpendBreakdown {
  totalBalance: number;
  protectedForBills: number;
  manuallyProtected: number;
  safeToSpend: number;
  billReserves: { billId: string; reserved: number }[];
}

export interface SafeToSpendInput {
  accounts: EngineAccount[];
  bills: EngineBill[];
  payPeriodDays: number;
  referenceDate: Date;
  /** Restrict the calculation to a set of account types (e.g. PERSONAL only). */
  includeAccountTypes?: EngineAccount["type"][];
}

/**
 * Safe-to-Spend: money that can be used without stealing from protected
 * bills or other explicitly reserved amounts. This must never overstate
 * spendable cash.
 */
export function calculateSafeToSpend(input: SafeToSpendInput): SafeToSpendBreakdown {
  const { accounts, bills, payPeriodDays, referenceDate, includeAccountTypes } = input;

  const eligibleAccounts = accounts.filter(
    (a) => !a.archived && (!includeAccountTypes || includeAccountTypes.includes(a.type)),
  );
  const eligibleAccountIds = new Set(eligibleAccounts.map((a) => a.id));

  const totalBalance = round2(eligibleAccounts.reduce((sum, a) => sum + a.currentBalance, 0));
  const manuallyProtected = round2(eligibleAccounts.reduce((sum, a) => sum + a.protectedAmount, 0));

  const billReserves = bills
    .filter((b) => !b.archived && eligibleAccountIds.has(b.accountId))
    .map((bill) => ({
      billId: bill.id,
      reserved: protectedReserveForBill(bill, payPeriodDays, referenceDate),
    }));

  const protectedForBills = round2(billReserves.reduce((sum, b) => sum + b.reserved, 0));

  const safeToSpend = round2(totalBalance - protectedForBills - manuallyProtected);

  return {
    totalBalance,
    protectedForBills,
    manuallyProtected,
    safeToSpend,
    billReserves,
  };
}
