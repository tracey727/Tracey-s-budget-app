import type { BillFrequency } from "./types";
import { annualiseCost, round2 } from "./frequency";

/**
 * Phase 14 — Recurring Cost & Supplier Waste Review (M08).
 *
 * A saving is only ever computed from the recorded before/after amounts —
 * never assumed from a "review" alone — matching the savings-measurement
 * blueprint's Category C rule: `verified saving = old cost - new cost`.
 */
export function annualisedSaving(
  previousAmount: number,
  newAmount: number,
  frequency: BillFrequency,
): number {
  return round2(annualiseCost(previousAmount, frequency) - annualiseCost(newAmount, frequency));
}

export function isRenewalApproaching(
  renewalDate: Date | null,
  referenceDate: Date,
  withinDays: number,
): boolean {
  if (!renewalDate) return false;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysAway = Math.round((renewalDate.getTime() - referenceDate.getTime()) / msPerDay);
  return daysAway >= 0 && daysAway <= withinDays;
}
