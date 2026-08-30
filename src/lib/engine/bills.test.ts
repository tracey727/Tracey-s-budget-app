import { describe, expect, it } from "vitest";
import { protectedReserveForBill, determineBillStatus, averagedContributionPerPay } from "./bills";

describe("protectedReserveForBill", () => {
  it("reserves nothing at the very start of an AVERAGED cycle", () => {
    const dueDate = new Date("2026-09-30");
    const cycleStart = new Date("2026-08-31"); // 30 days before (MONTHLY)
    const reserved = protectedReserveForBill(
      { amount: 100, dueDate, frequency: "MONTHLY", fundingMethod: "AVERAGED", archived: false },
      14,
      cycleStart,
    );
    expect(reserved).toBe(0);
  });

  it("reserves half at the midpoint of an AVERAGED monthly cycle", () => {
    const dueDate = new Date("2026-09-30");
    const midpoint = new Date("2026-09-15"); // 15 of 30 days elapsed
    const reserved = protectedReserveForBill(
      { amount: 100, dueDate, frequency: "MONTHLY", fundingMethod: "AVERAGED", archived: false },
      14,
      midpoint,
    );
    expect(reserved).toBe(50);
  });

  it("reserves the full amount once overdue", () => {
    const dueDate = new Date("2026-09-30");
    const afterDue = new Date("2026-10-02");
    const reserved = protectedReserveForBill(
      { amount: 100, dueDate, frequency: "MONTHLY", fundingMethod: "AVERAGED", archived: false },
      14,
      afterDue,
    );
    expect(reserved).toBe(100);
  });

  it("FULL_AMOUNT reserves nothing until inside the final pay period", () => {
    const dueDate = new Date("2026-09-30");
    const early = new Date("2026-09-01");
    const reserved = protectedReserveForBill(
      { amount: 200, dueDate, frequency: "MONTHLY", fundingMethod: "FULL_AMOUNT", archived: false },
      14,
      early,
    );
    expect(reserved).toBe(0);
  });

  it("FULL_AMOUNT reserves the full amount inside the final pay period", () => {
    const dueDate = new Date("2026-09-30");
    const close = new Date("2026-09-20"); // 10 days out, within 14-day pay period
    const reserved = protectedReserveForBill(
      { amount: 200, dueDate, frequency: "MONTHLY", fundingMethod: "FULL_AMOUNT", archived: false },
      14,
      close,
    );
    expect(reserved).toBe(200);
  });

  it("never reserves for an archived bill", () => {
    const reserved = protectedReserveForBill(
      {
        amount: 200,
        dueDate: new Date("2026-09-30"),
        frequency: "MONTHLY",
        fundingMethod: "FULL_AMOUNT",
        archived: true,
      },
      14,
      new Date("2026-09-29"),
    );
    expect(reserved).toBe(0);
  });
});

describe("determineBillStatus", () => {
  it("flags OVERDUE past the due date", () => {
    const status = determineBillStatus(
      { amount: 100, dueDate: new Date("2026-09-01"), fundingMethod: "AVERAGED", archived: false },
      50,
      14,
      new Date("2026-09-02"),
    );
    expect(status).toBe("OVERDUE");
  });

  it("flags FUNDED once fully reserved", () => {
    const status = determineBillStatus(
      { amount: 100, dueDate: new Date("2026-09-30"), fundingMethod: "AVERAGED", archived: false },
      100,
      14,
      new Date("2026-09-20"),
    );
    expect(status).toBe("FUNDED");
  });

  it("flags AT_RISK when close to due and underfunded", () => {
    const status = determineBillStatus(
      { amount: 100, dueDate: new Date("2026-09-30"), fundingMethod: "AVERAGED", archived: false },
      20,
      14,
      new Date("2026-09-25"), // 5 days out, within 14-day pay period, underfunded
    );
    expect(status).toBe("AT_RISK");
  });

  it("flags DUE_NEXT when far out and unfunded", () => {
    const status = determineBillStatus(
      { amount: 100, dueDate: new Date("2026-09-30"), fundingMethod: "AVERAGED", archived: false },
      0,
      14,
      new Date("2026-09-05"),
    );
    expect(status).toBe("DUE_NEXT");
  });
});

describe("averagedContributionPerPay", () => {
  it("splits a monthly bill across fortnightly pay periods", () => {
    // $100/month => $1200/yr => /26 fortnights = ~$46.15
    const contribution = averagedContributionPerPay(100, "MONTHLY", "FORTNIGHTLY");
    expect(contribution).toBeCloseTo(46.15, 1);
  });
});
