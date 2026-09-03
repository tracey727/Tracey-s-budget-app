"use client";

import { useActionState, useState } from "react";
import { recordCostDecision, type CostDecisionFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: CostDecisionFormState = {};

/** Phase 14 decision workflow: keep/cancel/renegotiate with a recorded before/after amount and evidence note. */
export function CostDecisionForm({ chargeId, currentAmount }: { chargeId: string; currentAmount: number }) {
  const [state, formAction, pending] = useActionState(recordCostDecision, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-gold">
        Record decision
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 flex w-full flex-col gap-2 border-t border-border pt-2">
      <input type="hidden" name="chargeId" value={chargeId} />
      <Input name="decisionNote" placeholder="Decision & evidence, e.g. 'Cancelled — invoice confirms $0 from Oct'" required />
      <div className="flex items-center gap-2">
        <Input
          name="newAmount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={currentAmount}
          className="w-32 py-2 text-sm"
        />
        <span className="text-xs text-muted">new amount (0 = cancelled)</span>
      </div>
      {state.error && <p className="text-xs text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" disabled={pending} className="w-fit px-3 py-2 text-xs">
          {pending ? "Saving…" : "Save decision"}
        </Button>
        <Button type="button" variant="ghost" className="px-3 py-2 text-xs" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
