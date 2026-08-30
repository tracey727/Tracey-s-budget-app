"use client";

import { useActionState, useState } from "react";
import { completeOnboarding, type OnboardingState } from "./actions";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: OnboardingState = {};

interface BillRow {
  key: number;
  name: string;
  amount: string;
  dueDate: string;
  frequency: string;
  fundingMethod: string;
}

let nextKey = 1;
function emptyBill(): BillRow {
  return { key: nextKey++, name: "", amount: "", dueDate: "", frequency: "MONTHLY", fundingMethod: "AVERAGED" };
}

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(completeOnboarding, initialState);
  const [bills, setBills] = useState<BillRow[]>([emptyBill()]);

  const today = new Date().toISOString().slice(0, 10);

  function updateBill(key: number, field: keyof BillRow, value: string) {
    setBills((prev) => prev.map((b) => (b.key === key ? { ...b, [field]: value } : b)));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">First-time setup</p>
      <h1 className="mt-2 font-display text-3xl text-ivory">Let&rsquo;s find your first money position</h1>
      <p className="mt-2 text-sm text-muted">
        A few details and Genevieve will show what&rsquo;s protected, what&rsquo;s safe to spend, and what to
        do next.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-8">
        <Card>
          <h2 className="font-display text-lg text-gold-light">Your pay cycle</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="What should we call it?">
              <Input name="payLabel" defaultValue="My Pay" required />
            </Field>
            <Field label="How often are you paid?">
              <Select name="payFrequency" defaultValue="FORTNIGHTLY">
                <option value="WEEKLY">Weekly</option>
                <option value="FORTNIGHTLY">Fortnightly</option>
                <option value="MONTHLY">Monthly</option>
              </Select>
            </Field>
            <Field label="Next pay date">
              <Input name="nextPayDate" type="date" defaultValue={today} required />
            </Field>
            <Field label="Income amount per pay">
              <Input name="incomeAmount" type="number" step="0.01" min="0" placeholder="0.00" required />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-gold-light">Your first account</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Account name">
              <Input name="accountName" defaultValue="Everyday Account" required />
            </Field>
            <Field label="Account type">
              <Select name="accountType" defaultValue="PERSONAL">
                <option value="PERSONAL">Personal</option>
                <option value="BUSINESS_OPERATING">Business operating</option>
              </Select>
            </Field>
            <Field label="Opening balance">
              <Input name="openingBalance" type="number" step="0.01" placeholder="0.00" required />
            </Field>
            <Field label="As of date">
              <Input name="openingBalanceDate" type="date" defaultValue={today} required />
            </Field>
          </div>
          <p className="mt-3 text-xs text-muted">
            This opening balance becomes a fixed historical record — your live balance will move
            separately as you use Genevieve.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-gold-light">Bills to protect (optional)</h2>
            <button
              type="button"
              onClick={() => setBills((prev) => [...prev, emptyBill()])}
              className="text-sm text-gold"
            >
              + Add bill
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {bills.map((bill) => (
              <div key={bill.key} className="rounded-xl border border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Bill name">
                    <Input
                      name="billName"
                      value={bill.name}
                      onChange={(e) => updateBill(bill.key, "name", e.target.value)}
                      placeholder="Rent, power, phone…"
                    />
                  </Field>
                  <Field label="Amount">
                    <Input
                      name="billAmount"
                      type="number"
                      step="0.01"
                      value={bill.amount}
                      onChange={(e) => updateBill(bill.key, "amount", e.target.value)}
                      placeholder="0.00"
                    />
                  </Field>
                  <Field label="Next due date">
                    <Input
                      name="billDueDate"
                      type="date"
                      value={bill.dueDate}
                      onChange={(e) => updateBill(bill.key, "dueDate", e.target.value)}
                    />
                  </Field>
                  <Field label="How often">
                    <Select
                      name="billFrequency"
                      value={bill.frequency}
                      onChange={(e) => updateBill(bill.key, "frequency", e.target.value)}
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="FORTNIGHTLY">Fortnightly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="ANNUALLY">Annually</option>
                    </Select>
                  </Field>
                  <Field label="Funding method">
                    <Select
                      name="billFundingMethod"
                      value={bill.fundingMethod}
                      onChange={(e) => updateBill(bill.key, "fundingMethod", e.target.value)}
                    >
                      <option value="AVERAGED">Averaged contribution per pay</option>
                      <option value="FULL_AMOUNT">Full amount from one pay</option>
                    </Select>
                  </Field>
                </div>
                {bills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setBills((prev) => prev.filter((b) => b.key !== bill.key))}
                    className="mt-3 text-xs text-muted hover:text-status-red"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {state.error && <p className="text-sm text-status-red">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Setting up your account…" : "See my money position"}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
    />
  );
}
