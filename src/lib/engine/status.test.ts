import { describe, expect, it } from "vitest";
import { determineMoneyStatus } from "./status";

describe("determineMoneyStatus", () => {
  it("RECOVERY always wins regardless of safe-to-spend", () => {
    const result = determineMoneyStatus({ safeToSpend: 5000, atRiskBillAmount: 0, recoveryActive: true });
    expect(result.status).toBe("RECOVERY");
  });

  it("RED when safe-to-spend is negative", () => {
    const result = determineMoneyStatus({ safeToSpend: -10, atRiskBillAmount: 0, recoveryActive: false });
    expect(result.status).toBe("RED");
  });

  it("RED when a bill is at risk even if safe-to-spend is positive", () => {
    const result = determineMoneyStatus({ safeToSpend: 200, atRiskBillAmount: 50, recoveryActive: false });
    expect(result.status).toBe("RED");
  });

  it("YELLOW when under the buffer", () => {
    const result = determineMoneyStatus({ safeToSpend: 40, atRiskBillAmount: 0, recoveryActive: false });
    expect(result.status).toBe("YELLOW");
  });

  it("GREEN when healthy", () => {
    const result = determineMoneyStatus({ safeToSpend: 500, atRiskBillAmount: 0, recoveryActive: false });
    expect(result.status).toBe("GREEN");
  });
});
