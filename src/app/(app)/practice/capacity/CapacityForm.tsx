"use client";

import { useActionState, useState } from "react";
import { createCapacitySnapshot, type CapacityFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: CapacityFormState = {};

export function CapacityForm() {
  const [state, formAction, pending] = useActionState(createCapacitySnapshot, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Add a capacity snapshot
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await formAction(formData);
        setOpen(false);
      }}
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
    >
      <Input name="label" placeholder="Label, e.g. Week of 3 Sep" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="periodStart" type="date" required />
        <Input name="periodEnd" type="date" required />
        <Input name="availableUnits" type="number" step="1" min="0" placeholder="Available appointment units" required />
        <Input name="filledUnits" type="number" step="1" min="0" placeholder="Filled units" required />
        <Input name="waitingDemandUnits" type="number" step="1" min="0" placeholder="Waiting-list demand" />
        <Input name="referralDemandUnits" type="number" step="1" min="0" placeholder="Referral demand" />
        <Input name="cancellationUnits" type="number" step="1" min="0" placeholder="Cancellation units" />
        <Input name="approvedNonWorkingUnits" type="number" step="1" min="0" placeholder="Approved leave/non-working units" />
      </div>
      <Input name="notes" placeholder="Notes (optional)" />
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save snapshot"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
