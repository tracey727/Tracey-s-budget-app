"use client";

import { useActionState } from "react";
import { startRecovery, updateProgress, type RecoveryFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: RecoveryFormState = {};

export function StartRecoveryForm() {
  const [state, formAction, pending] = useActionState(startRecovery, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <p className="text-sm text-ivory">Start a Back to Zero recovery plan</p>
      <p className="text-xs text-muted">
        Not a label of failure — a controlled, measurable path back to stability.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="shortfallAmount" type="number" step="0.01" placeholder="Current shortfall" required />
        <Input name="targetAmount" type="number" step="0.01" placeholder="Target to reach zero" required />
      </div>
      <textarea
        name="notes"
        placeholder="What happened, and what's the plan? (optional)"
        className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory placeholder:text-muted"
        rows={3}
      />
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Starting…" : "Start recovery plan"}
      </Button>
    </form>
  );
}

export function UpdateProgressForm({ recoveryId, progressAmount }: { recoveryId: string; progressAmount: number }) {
  const [state, formAction, pending] = useActionState(updateProgress, initialState);
  return (
    <form action={formAction} className="mt-3 flex items-center gap-2">
      <input type="hidden" name="recoveryId" value={recoveryId} />
      <Input name="progressAmount" type="number" step="0.01" defaultValue={progressAmount} className="w-32 py-2 text-sm" />
      <Button type="submit" variant="secondary" disabled={pending} className="px-3 py-2 text-xs">
        Update progress
      </Button>
      {state.error && <span className="text-xs text-status-red">{state.error}</span>}
    </form>
  );
}
