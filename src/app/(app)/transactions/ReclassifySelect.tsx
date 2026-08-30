"use client";

import { reclassifyTransaction } from "./actions";

export function ReclassifySelect({ transactionId, current }: { transactionId: string; current: string | null }) {
  return (
    <form action={reclassifyTransaction}>
      <input type="hidden" name="transactionId" value={transactionId} />
      <select
        name="classification"
        defaultValue={current ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-border bg-charcoal px-2 py-1 text-xs text-ivory"
      >
        <option value="" disabled>
          Classify
        </option>
        <option value="ESSENTIAL">Essential</option>
        <option value="WORTH_IT">Worth it</option>
        <option value="UNSURE">Unsure</option>
        <option value="WASTE">Waste</option>
      </select>
    </form>
  );
}
