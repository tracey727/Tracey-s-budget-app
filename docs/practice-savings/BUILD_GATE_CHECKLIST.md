# Build Gate Checklist — Phases 12-22 (this build)

Mirrors the blueprint's `11_BUILD_GATE_CHECKLIST.md`, scoped to what this
build actually covers. See `00_SCOPE_NOTE.md` for why Phases 0-11 are not
listed here (they were explicitly out of scope for this build).

- [x] **Phase 12 — Staff Time Waste & Duplication** — GREEN. At least one
      synthetic waste case can reach Verified savings with evidence:
      `src/app/(app)/practice/waste/*`, ledger hookup in
      `savings/actions.ts` (`verifySavingsCase`), covered by
      `src/lib/engine/waste.test.ts`.
- [x] **Phase 13 — Capacity & Utilisation** — GREEN. Approved non-working
      time is never avoidable; recoverable vs legitimate-spare is split;
      see `src/lib/engine/capacity.ts` + `capacity.test.ts`.
- [x] **Phase 14 — Recurring Cost & Supplier Waste** — GREEN. Annualised
      cost reductions derive from recorded before/after amounts:
      `src/lib/engine/recurringCost.ts`, wired into
      `subscriptions/actions.ts` (`recordCostDecision`).
- [x] **Phase 15 — Systemic Pattern, Waste & Prevention Command** — GREEN.
      Grouping is append-only (`PatternEvent`, never mutates the linked
      row); see `patterns.ts` + `patterns.test.ts`.
- [x] **Phase 16 — Verified Savings Ledger** — GREEN. Dashboard totals
      reconstruct purely from case rows (`summariseSavings`); the
      lifecycle and double-counting rules are unit-tested in
      `savings.test.ts`, backed by a DB-level unique constraint.
- [x] **Phase 17 — Irene Director Command Dashboard** — GREEN for the
      modules this build covers (staff efficiency, capacity, recurring
      cost, patterns, savings, alerts). Referral/reception/appointment/
      responsibility panels are explicitly not shown rather than
      fabricated — see the scope card on `/practice/dashboard`.
- [x] **Phase 18 — Alerts, Notifications & Accountability** — GREEN for
      dedupe/escalation-by-severity/acknowledgement; unit-tested in
      `alerts.test.ts`. No digest *batching UI* or scheduled/cron
      evaluation is built — alerts are evaluated on demand via "Check for
      new alerts"; see Developer Handoff note below.
- [~] **Phase 19 — Full Regression, Security, Load & UAT** — PARTIAL.
      Everything runnable offline is green (unit tests, typecheck, lint,
      build, tenant-isolation code audit). Live-DB, multi-user, load and
      E2E checks are not run — see `19_REGRESSION_SECURITY_UAT.md`.
- [ ] **Phase 20 — Production Deployment & Controlled Pilot** — NOT
      EXECUTED (no production infra access in this build session). Runbook
      in `20_22_DEPLOYMENT_BASELINE_SCALE.md`.
- [ ] **Phase 21 — Baseline Period & First Verified Savings** — NOT
      EXECUTED (requires real practice data under Phase 20 governance).
- [ ] **Phase 22 — Scale, Optimise & Prevent** — NOT EXECUTED (ongoing
      cadence that only starts once Phase 21 has real verified cases).

## Developer handoff note — alert scheduling

`runAlertCheck` (`practice/alerts/actions.ts`) is a manual server action
triggered by the "Check for new alerts" button. The blueprint's Phase 18
doesn't mandate a specific delivery mechanism, but a real pilot will want
this running on a schedule. Cloudflare Workers supports Cron Triggers
(`wrangler.jsonc` → `triggers.crons`) that could call the same logic; that
wiring was not added here because it is a Phase 20 (production
infrastructure) concern, not a Phase 18 (product logic) one, and this
build had no production Cloudflare project to configure it against.
