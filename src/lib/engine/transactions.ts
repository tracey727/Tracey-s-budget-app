import type { EngineTransaction } from "./types";
import { round2 } from "./frequency";

/** Internal transfers between owned accounts are excluded from income/expense/savings totals. */
export function excludeTransfers(transactions: EngineTransaction[]): EngineTransaction[] {
  return transactions.filter((t) => !t.isTransfer);
}

export interface SpendingSummary {
  income: number;
  expenses: number;
  byClassification: Record<"ESSENTIAL" | "WORTH_IT" | "UNSURE" | "WASTE" | "UNCLASSIFIED", number>;
}

export function summariseSpending(transactions: EngineTransaction[]): SpendingSummary {
  const real = excludeTransfers(transactions);

  const byClassification: SpendingSummary["byClassification"] = {
    ESSENTIAL: 0,
    WORTH_IT: 0,
    UNSURE: 0,
    WASTE: 0,
    UNCLASSIFIED: 0,
  };

  let income = 0;
  let expenses = 0;

  for (const t of real) {
    if (t.amount >= 0) {
      income = round2(income + t.amount);
      continue;
    }
    expenses = round2(expenses + Math.abs(t.amount));
    const key = t.classification ?? "UNCLASSIFIED";
    byClassification[key] = round2(byClassification[key] + Math.abs(t.amount));
  }

  return { income, expenses, byClassification };
}
