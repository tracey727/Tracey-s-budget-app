"use client";

import { useActionState, useState } from "react";
import { acknowledgeNotification, actionNotification, createAlertRule, runAlertCheck, toggleAlertRule, type AlertFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AlertFormState = {};

const TRIGGER_LABELS: Record<string, string> = {
  WASTE_RECURRING: "Recurring waste above a minutes threshold",
  CAPACITY_IDLE_HIGH: "Avoidable idle capacity above a threshold",
  COST_RENEWAL_DUE: "Recurring-cost renewal approaching",
  PATTERN_UNASSIGNED: "Identified pattern with no owner",
  SAVINGS_STALLED: "Savings case stalled in Approved/Implemented",
};

export function CreateAlertRuleForm() {
  const [state, formAction, pending] = useActionState(createAlertRule, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-gold">
        + Add an alert rule
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
      <Input name="name" placeholder="Rule name" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="triggerType" required className="rounded-xl border border-border bg-charcoal px-3 py-2 text-sm text-ivory">
          {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="severity" defaultValue="MEDIUM" className="rounded-xl border border-border bg-charcoal px-3 py-2 text-sm text-ivory">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <Input name="thresholdMinutes" type="number" step="1" min="0" placeholder="Minutes threshold (if relevant)" />
        <Input name="thresholdDays" type="number" step="1" min="0" placeholder="Days threshold (if relevant)" />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="digestOnly" />
        Digest only (review in a batch, don&rsquo;t alert individually)
      </label>
      {state.error && <p className="text-sm text-status-red">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save rule"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ToggleRuleButton({ ruleId, enabled }: { ruleId: string; enabled: boolean }) {
  return (
    <form action={toggleAlertRule}>
      <input type="hidden" name="ruleId" value={ruleId} />
      <input type="hidden" name="enabled" value={String(enabled)} />
      <button type="submit" className={`text-xs ${enabled ? "text-status-green" : "text-muted"}`}>
        {enabled ? "Enabled" : "Disabled"}
      </button>
    </form>
  );
}

export function RunCheckButton() {
  return (
    <form action={runAlertCheck}>
      <Button type="submit" variant="secondary" className="px-4 py-2 text-sm">
        Check for new alerts
      </Button>
    </form>
  );
}

export function AcknowledgeButton({ notificationId }: { notificationId: string }) {
  return (
    <form action={acknowledgeNotification}>
      <input type="hidden" name="notificationId" value={notificationId} />
      <button type="submit" className="text-xs text-gold">
        Acknowledge
      </button>
    </form>
  );
}

export function ActionedButton({ notificationId }: { notificationId: string }) {
  return (
    <form action={actionNotification}>
      <input type="hidden" name="notificationId" value={notificationId} />
      <button type="submit" className="text-xs text-status-green">
        Mark actioned
      </button>
    </form>
  );
}
