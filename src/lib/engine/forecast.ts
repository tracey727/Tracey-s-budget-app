import type { BillFrequency } from "./types";
import { frequencyDays, round2 } from "./frequency";

export interface ForecastBill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
}

export interface ForecastIncome {
  label: string;
  amount: number;
  nextDate: Date;
  frequency: BillFrequency;
}

export interface ForecastEvent {
  date: Date;
  label: string;
  amount: number; // positive = income, negative = bill
  runningBalance: number;
}

export interface ForecastResult {
  events: ForecastEvent[];
  firstShortfallDate: Date | null;
  endingBalance: number;
}

/**
 * Projects a starting balance forward across recurring bills and income
 * without touching the real ledger — a what-if scenario, not a transaction.
 */
export function projectCashFlow(
  startingBalance: number,
  bills: ForecastBill[],
  incomes: ForecastIncome[],
  horizonDays: number,
  referenceDate: Date,
): ForecastResult {
  const horizonEnd = new Date(referenceDate);
  horizonEnd.setDate(horizonEnd.getDate() + horizonDays);

  const events: { date: Date; label: string; amount: number }[] = [];

  for (const bill of bills) {
    let occurrence = new Date(bill.dueDate);
    const step = frequencyDays(bill.frequency);
    // Roll forward past occurrences into the forecast window.
    while (occurrence.getTime() < referenceDate.getTime()) {
      occurrence = addDays(occurrence, step);
    }
    while (occurrence.getTime() <= horizonEnd.getTime()) {
      events.push({ date: new Date(occurrence), label: bill.name, amount: -Math.abs(bill.amount) });
      occurrence = addDays(occurrence, step);
    }
  }

  for (const income of incomes) {
    let occurrence = new Date(income.nextDate);
    const step = frequencyDays(income.frequency);
    while (occurrence.getTime() < referenceDate.getTime()) {
      occurrence = addDays(occurrence, step);
    }
    while (occurrence.getTime() <= horizonEnd.getTime()) {
      events.push({ date: new Date(occurrence), label: income.label, amount: Math.abs(income.amount) });
      occurrence = addDays(occurrence, step);
    }
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  let running = startingBalance;
  let firstShortfallDate: Date | null = null;
  const timeline: ForecastEvent[] = events.map((e) => {
    running = round2(running + e.amount);
    if (running < 0 && !firstShortfallDate) firstShortfallDate = e.date;
    return { ...e, runningBalance: running };
  });

  return { events: timeline, firstShortfallDate, endingBalance: round2(running) };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
