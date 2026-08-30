import { describe, expect, it } from "vitest";
import { allocatePayCycleIncome } from "./payday";

describe("allocatePayCycleIncome", () => {
  it("allocates protected, essential, goal, then discretionary in order", () => {
    const result = allocatePayCycleIncome(1000, 400, 300, 100);
    expect(result.protectedAllocated).toBe(400);
    expect(result.essentialAllocated).toBe(300);
    expect(result.goalAllocated).toBe(100);
    expect(result.discretionary).toBe(200);
    expect(result.shortfall).toBe(0);
  });

  it("reports a shortfall when income can't cover protected commitments", () => {
    const result = allocatePayCycleIncome(300, 400, 200, 0);
    expect(result.protectedAllocated).toBe(300);
    expect(result.essentialAllocated).toBe(0);
    expect(result.discretionary).toBe(0);
    expect(result.shortfall).toBe(300); // 100 unmet protected + 200 unmet essential
  });
});
