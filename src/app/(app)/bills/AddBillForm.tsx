"use client";

import { useActionState, useState } from "react";
import { createBill, type BillFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: BillFormState = {};

export function AddBillForm({ accounts }: { accounts: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createBill, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Add a bill
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
        <Input name="name" placeholder="Bill name" required />
        <Input name="amount" type="number" step="0.01" placeholder="Amount" required />
        <Input name="dueDate" type="date" required />
        <select name="accountId" required className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory">
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select name="frequency" defaultValue="MONTHLY" className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory">
          <option value="WEEKLY">Weekly</option>
          <option value="FORTNIGHTLY">Fortnightly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="ANNUALLY">Annually</option>
        </select>
        <select name="fundingMethod" defaultValue="AVERAGED" className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory">
          <option value="AVERAGED">Averaged contribution per pay</option>
          <option value="FULL_AMOUNT">Full amount from one pay</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add bill"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
