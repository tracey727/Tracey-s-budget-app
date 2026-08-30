import { describe, expect, it } from "vitest";
import { calculateSafeToSpend } from "./safeToSpend";

describe("calculateSafeToSpend", () => {
  it("subtracts protected bill reserves and manual reserves from balance", () => {
    const result = calculateSafeToSpend({
      accounts: [
        { id: "a1", type: "PERSONAL", currentBalance: 1000, protectedAmount: 50, archived: false },
      ],
      bills: [
        {
          id: "b1",
          accountId: "a1",
          amount: 200,
          dueDate: new Date("2026-09-30"),
          frequency: "MONTHLY",
          fundingMethod: "AVERAGED",
          archived: false,
        },
      ],
      payPeriodDays: 14,
      referenceDate: new Date("2026-09-15"), // midpoint of the bill's monthly cycle
    });

    // Bill reserve at midpoint of a 30-day monthly cycle: ~50% of $200 = $100
    expect(result.protectedForBills).toBeCloseTo(100, 0);
    expect(result.manuallyProtected).toBe(50);
    expect(result.totalBalance).toBe(1000);
    expect(result.safeToSpend).toBeCloseTo(1000 - 100 - 50, 0);
  });

  it("never lets an archived account contribute balance or reserves", () => {
    const result = calculateSafeToSpend({
      accounts: [
        { id: "a1", type: "PERSONAL", currentBalance: 500, protectedAmount: 0, archived: true },
      ],
      bills: [],
      payPeriodDays: 14,
      referenceDate: new Date("2026-09-15"),
    });
    expect(result.totalBalance).toBe(0);
    expect(result.safeToSpend).toBe(0);
  });

  it("can go negative to signal a shortfall rather than floor at zero", () => {
    const result = calculateSafeToSpend({
      accounts: [{ id: "a1", type: "PERSONAL", currentBalance: 50, protectedAmount: 0, archived: false }],
      bills: [
        {
          id: "b1",
          accountId: "a1",
          amount: 300,
          dueDate: new Date("2026-09-01"),
          frequency: "MONTHLY",
          fundingMethod: "AVERAGED",
          archived: false,
        },
      ],
      payPeriodDays: 14,
      referenceDate: new Date("2026-09-02"), // overdue -> fully reserved
    });
    expect(result.safeToSpend).toBe(50 - 300);
  });

  it("filters by account type when includeAccountTypes is set", () => {
    const result = calculateSafeToSpend({
      accounts: [
        { id: "a1", type: "PERSONAL", currentBalance: 500, protectedAmount: 0, archived: false },
        { id: "a2", type: "BUSINESS_OPERATING", currentBalance: 900, protectedAmount: 0, archived: false },
      ],
      bills: [],
      payPeriodDays: 14,
      referenceDate: new Date("2026-09-15"),
      includeAccountTypes: ["PERSONAL"],
    });
    expect(result.totalBalance).toBe(500);
  });
});
