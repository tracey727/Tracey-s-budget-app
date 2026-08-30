import type { BillFrequency } from "./types";

/**
 * Nominal day-length per frequency, used for reservation-progress and
 * annualisation math. A 30/365 convention is used deliberately (not
 * calendar-accurate month arithmetic) so results are deterministic and
 * testable, matching the product contract's rule that money-rule
 * calculations must be deterministic and traceable.
 */
const FREQUENCY_DAYS: Record<BillFrequency, number> = {
  WEEKLY: 7,
  FORTNIGHTLY: 14,
  MONTHLY: 30,
  QUARTERLY: 91,
  ANNUALLY: 365,
};

const FREQUENCY_PERIODS_PER_YEAR: Record<BillFrequency, number> = {
  WEEKLY: 52,
  FORTNIGHTLY: 26,
  MONTHLY: 12,
  QUARTERLY: 4,
  ANNUALLY: 1,
};

export function frequencyDays(frequency: BillFrequency): number {
  return FREQUENCY_DAYS[frequency];
}

export function periodsPerYear(frequency: BillFrequency): number {
  return FREQUENCY_PERIODS_PER_YEAR[frequency];
}

/** Annualise a recurring amount so its true yearly impact is visible. */
export function annualiseCost(amount: number, frequency: BillFrequency): number {
  return round2(amount * periodsPerYear(frequency));
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
