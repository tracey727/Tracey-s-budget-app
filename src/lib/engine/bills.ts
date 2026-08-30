import type { BillStatus, EngineBill } from "./types";
import { daysBetween, frequencyDays, periodsPerYear, round2 } from "./frequency";

/**
 * How much of a bill's amount is currently reserved (protected) so it
 * cannot accidentally be presented as spendable.
 *
 * AVERAGED bills accrue their reserve smoothly across the billing cycle
 * (the "averaged contribution per pay" method from the product contract).
 * FULL_AMOUNT bills reserve nothing until the final pay period before the
 * due date, then reserve the full amount in one step.
 */
export function protectedReserveForBill(
  bill: Pick<EngineBill, "amount" | "dueDate" | "frequency" | "fundingMethod" | "archived">,
  payPeriodDays: number,
  referenceDate: Date,
): number {
  if (bill.archived) return 0;
  if (referenceDate.getTime() > bill.dueDate.getTime()) {
    // Overdue: fully protect until the bill is resolved, never overstate spendable cash.
    return bill.amount;
  }

  const cycleLength = frequencyDays(bill.frequency);
  const cycleStart = new Date(bill.dueDate);
  cycleStart.setDate(cycleStart.getDate() - cycleLength);

  if (bill.fundingMethod === "AVERAGED") {
    const elapsed = referenceDate.getTime() - cycleStart.getTime();
    const total = bill.dueDate.getTime() - cycleStart.getTime();
    const progress = Math.min(1, Math.max(0, elapsed / total));
    return round2(bill.amount * progress);
  }

  // FULL_AMOUNT: reserve the whole amount once we're within one pay period of the due date.
  const daysToDue = daysBetween(referenceDate, bill.dueDate);
  return daysToDue <= payPeriodDays ? bill.amount : 0;
}

export function determineBillStatus(
  bill: Pick<EngineBill, "amount" | "dueDate" | "fundingMethod" | "archived">,
  reservedAmount: number,
  payPeriodDays: number,
  referenceDate: Date,
): BillStatus {
  if (referenceDate.getTime() > bill.dueDate.getTime()) return "OVERDUE";
  if (reservedAmount >= bill.amount) return "FUNDED";

  const daysToDue = daysBetween(referenceDate, bill.dueDate);
  if (daysToDue <= payPeriodDays && reservedAmount < bill.amount) return "AT_RISK";
  if (reservedAmount > 0) return "PARTIALLY_FUNDED";
  return "DUE_NEXT";
}

/** Per-pay contribution for an AVERAGED bill: its annualised cost split across pay periods. */
export function averagedContributionPerPay(
  billAmount: number,
  billFrequency: EngineBill["frequency"],
  payFrequency: EngineBill["frequency"],
): number {
  const annualCost = billAmount * periodsPerYear(billFrequency);
  return round2(annualCost / periodsPerYear(payFrequency));
}
