"use client";

import { useActionState, useState } from "react";
import { createAccount, updateCurrentBalance, type AccountFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AccountFormState = {};

export function AddAccountForm() {
  const [state, formAction, pending] = useActionState(createAccount, initialState);
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Add another account
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
        <Input name="name" placeholder="Account name" required />
        <select
          name="type"
          defaultValue="PERSONAL"
          className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory"
        >
          <option value="PERSONAL">Personal</option>
          <option value="BUSINESS_OPERATING">Business operating</option>
        </select>
        <Input name="openingBalance" type="number" step="0.01" placeholder="Opening balance" required />
        <Input name="openingBalanceDate" type="date" defaultValue={today} required />
      </div>
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add account"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function UpdateBalanceForm({ accountId, currentBalance }: { accountId: string; currentBalance: number }) {
  const [state, formAction, pending] = useActionState(updateCurrentBalance, initialState);
  return (
    <form action={formAction} className="mt-3 flex items-center gap-2">
      <input type="hidden" name="accountId" value={accountId} />
      <Input
        name="currentBalance"
        type="number"
        step="0.01"
        defaultValue={currentBalance}
        className="w-32 py-2 text-sm"
      />
      <Button type="submit" variant="secondary" disabled={pending} className="px-3 py-2 text-xs">
        Update
      </Button>
      {state.error && <span className="text-xs text-status-red">{state.error}</span>}
    </form>
  );
}
