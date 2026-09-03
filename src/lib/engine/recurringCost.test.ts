import { describe, expect, it } from "vitest";
import { annualisedSaving, isRenewalApproaching } from "./recurringCost";

describe("annualisedSaving", () => {
  it("computes the yearly saving from a cancelled/renegotiated cost", () => {
    // $50/month cancelled entirely -> $600/year saved.
    expect(annualisedSaving(50, 0, "MONTHLY")).toBe(600);
  });

  it("is negative if the new cost is higher (a bad renegotiation)", () => {
    expect(annualisedSaving(50, 60, "MONTHLY")).toBe(-120);
  });
});

describe("isRenewalApproaching", () => {
  const today = new Date("2026-01-01T00:00:00Z");

  it("is false with no renewal date", () => {
    expect(isRenewalApproaching(null, today, 30)).toBe(false);
  });

  it("is true within the window", () => {
    expect(isRenewalApproaching(new Date("2026-01-15T00:00:00Z"), today, 30)).toBe(true);
  });

  it("is false once the renewal has already passed", () => {
    expect(isRenewalApproaching(new Date("2025-12-15T00:00:00Z"), today, 30)).toBe(false);
  });

  it("is false outside the window", () => {
    expect(isRenewalApproaching(new Date("2026-03-01T00:00:00Z"), today, 30)).toBe(false);
  });
});
