"use client";

import { useActionState } from "react";
import {
  confirmRootCause,
  createSavingsCaseFromWaste,
  planIntervention,
  recordMeasurement,
  startIntervention,
  type WasteFormState,
} from "./actions";
import { CATEGORY_LABELS } from "./LogWasteForm";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { releasedMinutes } from "@/lib/engine";

const initialState: WasteFormState = {};

export interface WasteEventRow {
  id: string;
  category: string;
  description: string;
  estimatedMinutes: number;
  isRecurring: boolean;
  recurrenceNote: string | null;
  rootCause: string | null;
  status: string;
  interventionDescription: string | null;
  baselineMinutes: number | null;
  postMinutes: number | null;
  hasSavingsCase: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  LOGGED: "Logged",
  ROOT_CAUSE_CONFIRMED: "Root cause confirmed",
  INTERVENTION_PLANNED: "Intervention planned",
  INTERVENTION_ACTIVE: "Intervention active",
  MEASURED: "Measured",
  VERIFIED: "Verified",
};

export function WasteEventCard({ event }: { event: WasteEventRow }) {
  const [rootCauseState, rootCauseAction, rootCausePending] = useActionState(confirmRootCause, initialState);
  const [interventionState, interventionAction, interventionPending] = useActionState(planIntervention, initialState);
  const [measureState, measureAction, measurePending] = useActionState(recordMeasurement, initialState);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-ivory">{event.description}</p>
          <p className="text-xs text-muted">
            {CATEGORY_LABELS[event.category] ?? event.category} · {event.estimatedMinutes} min
            {event.isRecurring && " · recurring"}
          </p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          {STATUS_LABELS[event.status] ?? event.status}
        </span>
      </div>

      {event.rootCause && <p className="text-sm text-muted">Root cause: {event.rootCause}</p>}
      {event.interventionDescription && <p className="text-sm text-muted">Intervention: {event.interventionDescription}</p>}
      {event.baselineMinutes != null && event.postMinutes != null && (
        <p className="text-sm text-status-green">
          Released {releasedMinutes(event.baselineMinutes, event.postMinutes)} min (baseline {event.baselineMinutes} → {event.postMinutes})
        </p>
      )}

      {event.status === "LOGGED" && (
        <form action={rootCauseAction} className="flex flex-col gap-2 border-t border-border pt-3">
          <input type="hidden" name="wasteEventId" value={event.id} />
          <Input name="rootCause" placeholder="What's the root cause?" required />
          {rootCauseState.error && <p className="text-xs text-status-red">{rootCauseState.error}</p>}
          <Button type="submit" variant="secondary" disabled={rootCausePending} className="w-fit px-3 py-2 text-xs">
            Confirm root cause &amp; freeze baseline
          </Button>
        </form>
      )}

      {event.status === "ROOT_CAUSE_CONFIRMED" && (
        <form action={interventionAction} className="flex flex-col gap-2 border-t border-border pt-3">
          <input type="hidden" name="wasteEventId" value={event.id} />
          <Input name="interventionDescription" placeholder="What corrective action will be taken?" required />
          {interventionState.error && <p className="text-xs text-status-red">{interventionState.error}</p>}
          <Button type="submit" variant="secondary" disabled={interventionPending} className="w-fit px-3 py-2 text-xs">
            Plan intervention
          </Button>
        </form>
      )}

      {event.status === "INTERVENTION_PLANNED" && (
        <form action={startIntervention} className="border-t border-border pt-3">
          <input type="hidden" name="wasteEventId" value={event.id} />
          <Button type="submit" variant="secondary" className="px-3 py-2 text-xs">
            Start intervention
          </Button>
        </form>
      )}

      {event.status === "INTERVENTION_ACTIVE" && (
        <form action={measureAction} className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-end">
          <input type="hidden" name="wasteEventId" value={event.id} />
          <Input name="postMinutes" type="number" step="1" min="0" placeholder="Minutes it now takes" required className="sm:w-48" />
          {measureState.error && <p className="text-xs text-status-red">{measureState.error}</p>}
          <Button type="submit" variant="secondary" disabled={measurePending} className="w-fit px-3 py-2 text-xs">
            Record measurement
          </Button>
        </form>
      )}

      {event.status === "MEASURED" && !event.hasSavingsCase && (
        <form action={createSavingsCaseFromWaste} className="border-t border-border pt-3">
          <input type="hidden" name="wasteEventId" value={event.id} />
          <Button type="submit" variant="secondary" className="px-3 py-2 text-xs">
            Send to savings ledger for verification
          </Button>
        </form>
      )}

      {event.hasSavingsCase && event.status !== "VERIFIED" && (
        <p className="border-t border-border pt-3 text-xs text-muted">
          In the savings ledger awaiting approval/verification.
        </p>
      )}
    </Card>
  );
}
