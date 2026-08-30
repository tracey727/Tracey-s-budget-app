"use client";

import { useActionState, useState } from "react";
import { createTransaction, type TransactionFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: TransactionFormState = {};

export function AddTransactionForm({ accounts }: { accounts: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createTransaction, initialState);
  const [open, setOpen] = useState(false);
  const [isTransfer, setIsTransfer] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Log a transaction
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
        <Input name="description" placeholder="Description" required />
        <Input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount (negative = spend, positive = income)"
          required
        />
        <Input name="date" type="date" defaultValue={today} required />
        <select name="accountId" required className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory">
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {!isTransfer && (
          <select name="classification" defaultValue="" className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory">
            <option value="">Unclassified</option>
            <option value="ESSENTIAL">Essential</option>
            <option value="WORTH_IT">Worth it</option>
            <option value="UNSURE">Unsure</option>
            <option value="WASTE">Waste</option>
          </select>
        )}
      </div>
      <label className="flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          name="isTransfer"
          checked={isTransfer}
          onChange={(e) => setIsTransfer(e.target.checked)}
        />
        This is a transfer between my own accounts (excluded from spending totals)
      </label>
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save transaction"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
