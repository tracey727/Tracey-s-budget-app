import type { MoneyStatus } from "./types";

export interface StatusResult {
  status: MoneyStatus;
  reason: string;
}

export interface DetermineStatusInput {
  safeToSpend: number;
  /** Sum of bills currently AT_RISK or OVERDUE. */
  atRiskBillAmount: number;
  recoveryActive: boolean;
  /** Buffer below which the position is considered "pressure building". Defaults to $100. */
  yellowBuffer?: number;
}

/**
 * Determine the Green / Yellow / Red / Recovery status. Recovery always
 * wins (a return-to-zero plan is in progress). Red means recovery is
 * required. Yellow means pressure is building. Green is normal control.
 */
export function determineMoneyStatus(input: DetermineStatusInput): StatusResult {
  const { safeToSpend, atRiskBillAmount, recoveryActive, yellowBuffer = 100 } = input;

  if (recoveryActive) {
    return {
      status: "RECOVERY",
      reason: "A return-to-zero recovery plan is active. Protected essentials come first.",
    };
  }

  if (safeToSpend < 0 || atRiskBillAmount > 0) {
    return {
      status: "RED",
      reason:
        safeToSpend < 0
          ? "Safe-to-Spend has gone negative — protected bills are at risk."
          : "A bill is at risk of going unfunded before it's due.",
    };
  }

  if (safeToSpend < yellowBuffer) {
    return {
      status: "YELLOW",
      reason: "Pressure is building — safe-to-spend is getting tight before your next payday.",
    };
  }

  return {
    status: "GREEN",
    reason: "Bills are protected and your position is healthy.",
  };
}
