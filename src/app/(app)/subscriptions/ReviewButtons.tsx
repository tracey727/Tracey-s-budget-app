"use client";

import { reviewRecurringCharge } from "./actions";

const OPTIONS: { value: "KEEP" | "RECONSIDER" | "CANCELLED"; label: string; active: string }[] = [
  { value: "KEEP", label: "Keep", active: "text-status-green" },
  { value: "RECONSIDER", label: "Reconsider", active: "text-status-yellow" },
  { value: "CANCELLED", label: "Cancelled", active: "text-status-red" },
];

export function ReviewButtons({ chargeId, current }: { chargeId: string; current: string }) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <form key={opt.value} action={reviewRecurringCharge}>
          <input type="hidden" name="chargeId" value={chargeId} />
          <input type="hidden" name="reviewStatus" value={opt.value} />
          <button
            type="submit"
            className={`text-xs ${current === opt.value ? opt.active + " font-semibold" : "text-muted hover:text-ivory"}`}
          >
            {opt.label}
          </button>
        </form>
      ))}
    </div>
  );
}
