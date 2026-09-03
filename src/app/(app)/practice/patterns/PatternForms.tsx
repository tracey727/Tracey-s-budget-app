"use client";

import { useActionState, useState } from "react";
import {
  assignPreventionAction,
  createPattern,
  linkEventToPattern,
  measurePattern,
  startPatternProgress,
  type PatternFormState,
} from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: PatternFormState = {};

export function CreatePatternForm() {
  const [state, formAction, pending] = useActionState(createPattern, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Identify a systemic pattern
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
      <Input name="title" placeholder="Pattern, e.g. Referral details re-keyed every intake" required />
      <Input name="description" placeholder="Description (optional)" />
      <Input name="rootCause" placeholder="Common root cause (optional)" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="estimatedImpactMinutes" type="number" step="1" min="0" placeholder="Estimated minutes/occurrence" />
        <Input name="estimatedImpactCurrency" type="number" step="0.01" min="0" placeholder="Estimated $ impact" />
      </div>
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save pattern"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AssignPreventionForm({ patternId }: { patternId: string }) {
  const [state, formAction, pending] = useActionState(assignPreventionAction, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-border pt-3">
      <input type="hidden" name="patternId" value={patternId} />
      <Input name="ownerName" placeholder="Owner" required />
      <Input name="dueDate" type="date" required />
      <Input name="preventionAction" placeholder="Prevention action" required />
      {state.error && <p className="text-xs text-status-red">{state.error}</p>}
      <Button type="submit" variant="secondary" disabled={pending} className="w-fit px-3 py-2 text-xs">
        Assign prevention action
      </Button>
    </form>
  );
}

export function MeasurePatternForm({ patternId }: { patternId: string }) {
  const [state, formAction, pending] = useActionState(measurePattern, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-border pt-3">
      <input type="hidden" name="patternId" value={patternId} />
      <Input name="measuredResultNote" placeholder="What changed after the prevention action?" required />
      {state.error && <p className="text-xs text-status-red">{state.error}</p>}
      <Button type="submit" variant="secondary" disabled={pending} className="w-fit px-3 py-2 text-xs">
        Record measured result
      </Button>
    </form>
  );
}

export function LinkEventForm({ patternId }: { patternId: string }) {
  const [state, formAction, pending] = useActionState(linkEventToPattern, initialState);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
      <input type="hidden" name="patternId" value={patternId} />
      <select name="sourceType" defaultValue="WASTE_EVENT" className="rounded-xl border border-border bg-charcoal px-3 py-2 text-xs text-ivory">
        <option value="WASTE_EVENT">Waste event</option>
        <option value="RECURRING_COST">Recurring cost</option>
        <option value="CAPACITY_SNAPSHOT">Capacity snapshot</option>
        <option value="MANUAL">Other</option>
      </select>
      <Input name="sourceId" placeholder="Event ID" className="w-40 py-2 text-xs" required />
      <Input name="note" placeholder="Note (optional)" className="w-40 py-2 text-xs" />
      <Button type="submit" variant="ghost" disabled={pending} className="px-3 py-2 text-xs">
        Link
      </Button>
      {state.error && <span className="text-xs text-status-red">{state.error}</span>}
    </form>
  );
}

export function StartProgressButton({ patternId }: { patternId: string }) {
  return (
    <form action={startPatternProgress} className="border-t border-border pt-3">
      <input type="hidden" name="patternId" value={patternId} />
      <Button type="submit" variant="secondary" className="px-3 py-2 text-xs">
        Start prevention work
      </Button>
    </form>
  );
}
