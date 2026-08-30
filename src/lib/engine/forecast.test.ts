import { describe, expect, it } from "vitest";
import { projectCashFlow } from "./forecast";

describe("projectCashFlow", () => {
  it("warns before a shortfall rather than after it happens", () => {
    const result = projectCashFlow(
      100,
      [{ id: "b1", name: "Rent", amount: 500, dueDate: new Date("2026-09-10"), frequency: "MONTHLY" }],
      [],
      30,
      new Date("2026-09-01"),
    );
    expect(result.firstShortfallDate).not.toBeNull();
    expect(result.endingBalance).toBe(100 - 500);
  });

  it("nets income against bills across the horizon", () => {
    const result = projectCashFlow(
      0,
      [{ id: "b1", name: "Rent", amount: 400, dueDate: new Date("2026-09-05"), frequency: "MONTHLY" }],
      [{ label: "Pay", amount: 1000, nextDate: new Date("2026-09-01"), frequency: "FORTNIGHTLY" }],
      20,
      new Date("2026-09-01"),
    );
    // Pay on 9/1 (+1000), Rent on 9/5 (-400), Pay on 9/15 (+1000) => 1600
    expect(result.endingBalance).toBe(1600);
    expect(result.firstShortfallDate).toBeNull();
  });

  it("never mutates the real ledger — it only returns a projection", () => {
    const bills = [{ id: "b1", name: "Power", amount: 200, dueDate: new Date("2026-09-01"), frequency: "MONTHLY" as const }];
    const before = JSON.stringify(bills);
    projectCashFlow(500, bills, [], 30, new Date("2026-09-01"));
    expect(JSON.stringify(bills)).toBe(before);
  });
});
