"use client";

import { useActionState, useState } from "react";
import { createGoal, updateVerifiedAmount, type GoalFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: GoalFormState = {};

export function AddGoalForm() {
  const [state, formAction, pending] = useActionState(createGoal, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Add a savings goal
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
        <Input name="name" placeholder="Emergency fund, holiday…" required />
        <Input name="targetAmount" type="number" step="0.01" placeholder="Target amount" required />
        <Input name="targetDate" type="date" />
        <Input name="contributionPlan" type="number" step="0.01" placeholder="Planned contribution per pay" />
      </div>
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add goal"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function UpdateVerifiedForm({ goalId, verifiedAmount }: { goalId: string; verifiedAmount: number }) {
  const [, formAction, pending] = useActionState(updateVerifiedAmount, initialState);
  return (
    <form action={formAction} className="mt-3 flex items-center gap-2">
      <input type="hidden" name="goalId" value={goalId} />
      <Input name="verifiedAmount" type="number" step="0.01" defaultValue={verifiedAmount} className="w-32 py-2 text-sm" />
      <Button type="submit" variant="secondary" disabled={pending} className="px-3 py-2 text-xs">
        Update verified
      </Button>
    </form>
  );
}
