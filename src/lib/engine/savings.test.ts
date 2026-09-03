import { describe, expect, it } from "vitest";
import {
  canAdvanceSavingsState,
  computeVerifiedAmount,
  isDuplicateSourceLink,
  summariseSavings,
} from "./savings";

const baseFields = { baselineValue: 100, postValue: null, evidenceNote: null, approvedBy: null, verifiedBy: null };

describe("canAdvanceSavingsState", () => {
  it("requires a positive baseline and an approver to approve", () => {
    expect(canAdvanceSavingsState("POTENTIAL", "APPROVED", { ...baseFields, baselineValue: 0, approvedBy: "Irene" }).allowed).toBe(
      false,
    );
    expect(canAdvanceSavingsState("POTENTIAL", "APPROVED", { ...baseFields, approvedBy: null }).allowed).toBe(false);
    expect(canAdvanceSavingsState("POTENTIAL", "APPROVED", { ...baseFields, approvedBy: "Irene" }).allowed).toBe(true);
  });

  it("requires a post value to measure", () => {
    expect(canAdvanceSavingsState("IMPLEMENTED", "MEASURED", { ...baseFields, postValue: null }).allowed).toBe(false);
    expect(canAdvanceSavingsState("IMPLEMENTED", "MEASURED", { ...baseFields, postValue: 40 }).allowed).toBe(true);
  });

  it("requires evidence and a verifier to verify", () => {
    expect(
      canAdvanceSavingsState("MEASURED", "VERIFIED", { ...baseFields, postValue: 40, evidenceNote: null, verifiedBy: "Manager" })
        .allowed,
    ).toBe(false);
    expect(
      canAdvanceSavingsState("MEASURED", "VERIFIED", {
        ...baseFields,
        postValue: 40,
        evidenceNote: "Invoice attached",
        verifiedBy: null,
      }).allowed,
    ).toBe(false);
    expect(
      canAdvanceSavingsState("MEASURED", "VERIFIED", {
        ...baseFields,
        postValue: 40,
        evidenceNote: "Invoice attached",
        verifiedBy: "Manager",
      }).allowed,
    ).toBe(true);
  });

  it("blocks skipping a lifecycle step", () => {
    expect(canAdvanceSavingsState("POTENTIAL", "IMPLEMENTED", { ...baseFields, approvedBy: "Irene" }).allowed).toBe(false);
  });

  it("blocks moving backward", () => {
    expect(canAdvanceSavingsState("VERIFIED", "MEASURED", baseFields).allowed).toBe(false);
  });
});

describe("computeVerifiedAmount", () => {
  it("uses the actual achieved value for recovered revenue, ignoring baseline", () => {
    expect(computeVerifiedAmount("RECOVERED_REVENUE", 500, 180)).toBe(180);
  });

  it("uses baseline minus post for avoided cost", () => {
    expect(computeVerifiedAmount("AVOIDED_COST", 50, 0)).toBe(50);
  });

  it("uses baseline minus post for released staff time (minutes)", () => {
    expect(computeVerifiedAmount("RELEASED_STAFF_TIME", 15, 5)).toBe(10);
  });
});

describe("isDuplicateSourceLink", () => {
  it("flags a source already backing another case", () => {
    const existing = [{ sourceType: "WASTE_EVENT", sourceId: "w1" }];
    expect(isDuplicateSourceLink(existing, { sourceType: "WASTE_EVENT", sourceId: "w1" })).toBe(true);
  });

  it("never flags manual entries (no shared source)", () => {
    const existing = [{ sourceType: "MANUAL", sourceId: null }];
    expect(isDuplicateSourceLink(existing, { sourceType: "MANUAL", sourceId: null })).toBe(false);
  });
});

describe("summariseSavings", () => {
  it("reconstructs headline totals only from VERIFIED cases", () => {
    const summary = summariseSavings([
      { category: "RECOVERED_REVENUE", state: "VERIFIED", baselineValue: 500, postValue: 180 },
      { category: "AVOIDED_COST", state: "VERIFIED", baselineValue: 50, postValue: 0 },
      { category: "RELEASED_STAFF_TIME", state: "VERIFIED", baselineValue: 15, postValue: 5 },
      { category: "AVOIDED_COST", state: "POTENTIAL", baselineValue: 999, postValue: null },
    ]);

    expect(summary.verifiedRecoveredRevenue).toBe(180);
    expect(summary.verifiedAvoidedCost).toBe(50);
    expect(summary.verifiedReleasedTimeMinutes).toBe(10);
    expect(summary.potentialValue).toBe(999);
    expect(summary.totalVerifiedBenefit).toBe(230);
  });
});
