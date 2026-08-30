import { round2 } from "./frequency";

export interface PaydayAllocation {
  income: number;
  protectedAllocated: number;
  essentialAllocated: number;
  goalAllocated: number;
  discretionary: number;
  shortfall: number;
}

/**
 * Allocate a pay cycle's income: protected commitments first, then
 * essentials and goals, before presenting discretionary capacity. If
 * income can't cover protected commitments, the gap is reported as a
 * shortfall rather than silently borrowed from elsewhere.
 */
export function allocatePayCycleIncome(
  income: number,
  protectedBillContribution: number,
  essentialCommitments: number,
  goalContribution: number,
): PaydayAllocation {
  let remaining = income;

  const protectedAllocated = round2(Math.min(remaining, protectedBillContribution));
  remaining = round2(remaining - protectedAllocated);

  const essentialAllocated = round2(Math.min(remaining, essentialCommitments));
  remaining = round2(remaining - essentialAllocated);

  const goalAllocated = round2(Math.min(remaining, goalContribution));
  remaining = round2(remaining - goalAllocated);

  const shortfall = round2(
    Math.max(0, protectedBillContribution - protectedAllocated) +
      Math.max(0, essentialCommitments - essentialAllocated),
  );

  return {
    income,
    protectedAllocated,
    essentialAllocated,
    goalAllocated,
    discretionary: round2(Math.max(0, remaining)),
    shortfall,
  };
}
