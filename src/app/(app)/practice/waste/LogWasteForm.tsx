"use client";

import { useActionState, useState } from "react";
import { logWasteEvent, type WasteFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: WasteFormState = {};

const CATEGORY_LABELS: Record<string, string> = {
  DUPLICATE_WORK: "Duplicate work",
  REWORK: "Rework",
  SEARCHING: "Searching for information",
  WAITING: "Waiting on someone/something",
  MANUAL_ENTRY: "Avoidable manual entry",
  WRONG_ROLE_WORK: "Wrong-role work",
  UNNECESSARY_APPROVAL: "Unnecessary approval step",
};

export function LogWasteForm() {
  const [state, formAction, pending] = useActionState(logWasteEvent, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Log a waste event
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
      <Input name="description" placeholder="What happened? e.g. Re-entered referral details twice" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="category" required className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory">
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Input name="estimatedMinutes" type="number" step="1" min="1" placeholder="Estimated minutes" required />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="isRecurring" className="h-4 w-4" />
        This keeps happening (recurring)
      </label>
      <Input name="recurrenceNote" placeholder="How often does it recur? (optional)" />
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Logging…" : "Log waste event"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export { CATEGORY_LABELS };
