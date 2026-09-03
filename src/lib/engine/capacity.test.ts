import { describe, expect, it } from "vitest";
import { classifyCapacity, utilisationTrend } from "./capacity";

const base = {
  id: "cap-1",
  availableUnits: 100,
  filledUnits: 70,
  waitingDemandUnits: 0,
  referralDemandUnits: 0,
  cancellationUnits: 0,
  approvedNonWorkingUnits: 0,
};

describe("classifyCapacity", () => {
  it("treats approved non-working time as never avoidable", () => {
    const result = classifyCapacity({ ...base, approvedNonWorkingUnits: 30 });
    expect(result.idleUnits).toBe(30);
    expect(result.avoidableIdleUnits).toBe(0);
  });

  it("splits avoidable idle into recoverable (matched by demand) and legitimate spare", () => {
    const result = classifyCapacity({ ...base, waitingDemandUnits: 10, referralDemandUnits: 5 });
    expect(result.idleUnits).toBe(30);
    expect(result.avoidableIdleUnits).toBe(30);
    expect(result.recoverableUnits).toBe(15);
    expect(result.legitimateSpareUnits).toBe(15);
  });

  it("caps recoverable at the avoidable idle amount even if demand is larger", () => {
    const result = classifyCapacity({ ...base, waitingDemandUnits: 50, referralDemandUnits: 50 });
    expect(result.recoverableUnits).toBe(30);
    expect(result.legitimateSpareUnits).toBe(0);
  });

  it("never goes negative when filled exceeds available (overbooking)", () => {
    const result = classifyCapacity({ ...base, filledUnits: 120 });
    expect(result.idleUnits).toBe(0);
    expect(result.avoidableIdleUnits).toBe(0);
  });

  it("computes utilisation percent safely when available is zero", () => {
    const result = classifyCapacity({ ...base, availableUnits: 0, filledUnits: 0 });
    expect(result.utilisationPercent).toBe(0);
  });
});

describe("utilisationTrend", () => {
  it("reports UP/DOWN/FLAT with a deadband to avoid noise", () => {
    expect(utilisationTrend(70, 80)).toBe("UP");
    expect(utilisationTrend(80, 70)).toBe("DOWN");
    expect(utilisationTrend(70, 70.2)).toBe("FLAT");
  });
});
