"use client";

import { useActionState, useState } from "react";
import { createRecurringCharge, type ChargeFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: ChargeFormState = {};

export function AddChargeForm() {
  const [state, formAction, pending] = useActionState(createRecurringCharge, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Add a subscription
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
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="name" placeholder="Netflix, Xero, gym…" required />
        <Input name="amount" type="number" step="0.01" placeholder="Amount" required />
        <select name="frequency" defaultValue="MONTHLY" className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory">
          <option value="WEEKLY">Weekly</option>
          <option value="FORTNIGHTLY">Fortnightly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="ANNUALLY">Annually</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="isBusinessCost" />
          Business/operating cost
        </label>
      </div>
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
