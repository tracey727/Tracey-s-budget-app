"use client";

import { useActionState, useState } from "react";
import {
  approveSavingsCase,
  createManualSavingsCase,
  markImplemented,
  measureSavingsCase,
  verifySavingsCase,
  type SavingsFormState,
} from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: SavingsFormState = {};

export function CreateManualCaseForm() {
  const [state, formAction, pending] = useActionState(createManualSavingsCase, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Add a savings case manually
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
      <Input name="title" placeholder="Title" required />
      <Input name="description" placeholder="Description (optional)" />
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="category" required className="rounded-xl border border-border bg-charcoal px-3 py-2 text-sm text-ivory">
          <option value="RECOVERED_REVENUE">Recovered revenue</option>
          <option value="AVOIDED_COST">Avoided cost</option>
          <option value="RELEASED_STAFF_TIME">Released staff time</option>
        </select>
        <Input name="baselineValue" type="number" step="0.01" min="0" placeholder="Baseline value" required />
        <select name="baselineUnit" required className="rounded-xl border border-border bg-charcoal px-3 py-2 text-sm text-ivory">
          <option value="CURRENCY">$ currency</option>
          <option value="MINUTES">Minutes</option>
        </select>
      </div>
      <Input name="calculationMethod" placeholder="Calculation method (required for traceability)" required />
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save case"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ApproveForm({ caseId }: { caseId: string }) {
  const [state, formAction, pending] = useActionState(approveSavingsCase, initialState);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
      <input type="hidden" name="caseId" value={caseId} />
      <Input name="approvedBy" placeholder="Approving manager" className="w-48 py-2 text-xs" required />
      <Button type="submit" variant="secondary" disabled={pending} className="px-3 py-2 text-xs">
        Approve
      </Button>
      {state.error && <span className="text-xs text-status-red">{state.error}</span>}
    </form>
  );
}

export function ImplementButton({ caseId }: { caseId: string }) {
  return (
    <form action={markImplemented} className="border-t border-border pt-3">
      <input type="hidden" name="caseId" value={caseId} />
      <Button type="submit" variant="secondary" className="px-3 py-2 text-xs">
        Mark implemented
      </Button>
    </form>
  );
}

export function MeasureForm({ caseId }: { caseId: string }) {
  const [state, formAction, pending] = useActionState(measureSavingsCase, initialState);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
      <input type="hidden" name="caseId" value={caseId} />
      <Input name="postValue" type="number" step="0.01" min="0" placeholder="Actual measured result" className="w-48 py-2 text-xs" required />
      <Button type="submit" variant="secondary" disabled={pending} className="px-3 py-2 text-xs">
        Record measurement
      </Button>
      {state.error && <span className="text-xs text-status-red">{state.error}</span>}
    </form>
  );
}

export function VerifyForm({ caseId }: { caseId: string }) {
  const [state, formAction, pending] = useActionState(verifySavingsCase, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-border pt-3">
      <input type="hidden" name="caseId" value={caseId} />
      <Input name="evidenceNote" placeholder="Evidence (invoice, booking record, timestamps…)" required />
      <Input name="verifiedBy" placeholder="Verifying person" required />
      {state.error && <p className="text-xs text-status-red">{state.error}</p>}
      <Button type="submit" variant="secondary" disabled={pending} className="w-fit px-3 py-2 text-xs">
        Verify
      </Button>
    </form>
  );
}
