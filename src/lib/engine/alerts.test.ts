import { describe, expect, it } from "vitest";
import {
  dedupeKeyFor,
  evaluateCapacityIdleAlerts,
  evaluatePatternUnassignedAlerts,
  evaluateRenewalDueAlerts,
  evaluateSavingsStalledAlerts,
  evaluateWasteRecurringAlerts,
  filterNewCandidates,
} from "./alerts";

describe("evaluateWasteRecurringAlerts", () => {
  it("flags recurring, still-LOGGED waste at or above the threshold", () => {
    const alerts = evaluateWasteRecurringAlerts(
      [
        { id: "w1", description: "Re-entering referral details", isRecurring: true, status: "LOGGED", estimatedMinutes: 20 },
        { id: "w2", description: "One-off typo fix", isRecurring: false, status: "LOGGED", estimatedMinutes: 20 },
        { id: "w3", description: "Small recurring thing", isRecurring: true, status: "LOGGED", estimatedMinutes: 2 },
        { id: "w4", description: "Already handled", isRecurring: true, status: "VERIFIED", estimatedMinutes: 20 },
      ],
      10,
    );
    expect(alerts.map((a) => a.sourceId)).toEqual(["w1"]);
  });
});

describe("evaluateCapacityIdleAlerts", () => {
  it("flags snapshots whose avoidable idle exceeds the threshold", () => {
    const alerts = evaluateCapacityIdleAlerts(
      [
        {
          id: "c1",
          label: "Week 1",
          availableUnits: 100,
          filledUnits: 60,
          waitingDemandUnits: 0,
          referralDemandUnits: 0,
          cancellationUnits: 0,
          approvedNonWorkingUnits: 0,
        },
      ],
      20,
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0].sourceId).toBe("c1");
  });
});

describe("evaluateRenewalDueAlerts", () => {
  it("skips charges already decided CANCELLED", () => {
    const today = new Date("2026-01-01T00:00:00Z");
    const alerts = evaluateRenewalDueAlerts(
      [{ id: "r1", name: "Old CRM", renewalDate: new Date("2026-01-10T00:00:00Z"), reviewStatus: "CANCELLED" }],
      today,
      30,
    );
    expect(alerts).toHaveLength(0);
  });
});

describe("evaluatePatternUnassignedAlerts", () => {
  it("flags identified patterns with no owner", () => {
    const alerts = evaluatePatternUnassignedAlerts([
      { id: "p1", title: "Duplicate intake forms", status: "IDENTIFIED", ownerName: null },
      { id: "p2", title: "Assigned already", status: "IDENTIFIED", ownerName: "Manager" },
    ]);
    expect(alerts.map((a) => a.sourceId)).toEqual(["p1"]);
  });
});

describe("evaluateSavingsStalledAlerts", () => {
  it("flags APPROVED/IMPLEMENTED cases with no recent update", () => {
    const today = new Date("2026-01-31T00:00:00Z");
    const alerts = evaluateSavingsStalledAlerts(
      [
        { id: "s1", title: "Cancel unused tool", state: "APPROVED", updatedAt: new Date("2026-01-01T00:00:00Z") },
        { id: "s2", title: "Fresh one", state: "APPROVED", updatedAt: new Date("2026-01-30T00:00:00Z") },
        { id: "s3", title: "Already verified", state: "VERIFIED", updatedAt: new Date("2026-01-01T00:00:00Z") },
      ],
      today,
      14,
    );
    expect(alerts.map((a) => a.sourceId)).toEqual(["s1"]);
  });
});

describe("filterNewCandidates + dedupeKeyFor", () => {
  it("suppresses a candidate whose condition already has an open notification", () => {
    const candidates = [
      { triggerType: "WASTE_RECURRING" as const, severity: "MEDIUM" as const, title: "t", body: "b", sourceType: "WASTE_EVENT", sourceId: "w1", dedupeKey: dedupeKeyFor("WASTE_RECURRING", "w1") },
    ];
    const suppressed = filterNewCandidates(candidates, new Set([dedupeKeyFor("WASTE_RECURRING", "w1")]));
    expect(suppressed).toHaveLength(0);

    const allowed = filterNewCandidates(candidates, new Set());
    expect(allowed).toHaveLength(1);
  });
});
