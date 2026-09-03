# Scope Note — Practice Savings & Revenue Protection Command

Source blueprint: `IRENE_PRACTICE_SAVINGS_MASTER_BLUEPRINT.md` package (Sept 2026),
`05_CHRONOLOGICAL_BUILD_PLAN.md` in particular.

## What was asked

Build phases **12 through 22** of the blueprint's chronological plan, in order,
skipping phases 0–11.

## Why that matters

The blueprint's own Golden Rule is "build one phase at a time; do not begin the
next phase until the current GREEN GATE is passed." Phases 0–11 would normally
establish, in order:

- Phase 0–3: product contract, loss map, savings-measurement contract,
  **organisation/centre/role information architecture**.
- Phase 4–6: repo/environment foundation, **database spine with
  organisation/centre/user/role tables**, authentication/authorisation/audit.
- Phase 7: the **generic work-item ownership engine** (one current owner,
  due dates, transfer-with-acceptance, escalation).
- Phase 8–11: No Lost Referral™, reception flow, appointment leakage/refill,
  leave/handover continuity.

None of that exists in this repository — it is a personal/practice budgeting
app (`genevieve-budget-app`) with a single `User` model and no
organisation/centre/role/work-item tables at all.

## Decision made for this build

Phases 12–18 (the ones with buildable product surface — 19–22 are process/
deployment phases, handled separately) were implemented **user-scoped**,
following the exact tenancy pattern every existing model in this app already
uses (`userId` foreign key + a `userId`-scoped Prisma query in every server
action), rather than inventing a parallel organisation/centre/role system
that Phase 3 and Phase 6 would normally define. Concretely:

- No `Organisation`/`Centre`/`Role` tables. "Tenant isolation" in this build
  means per-`User` isolation, matching the rest of the codebase.
- No generic `work_item` engine from Phase 7. Each module (waste event,
  capacity snapshot, systemic pattern, savings case, alert rule/notification)
  has its own status/state machine instead of sharing one generic engine.
- Verification/approval steps (Phase 16's Potential→Verified lifecycle)
  are enforced as **workflow gates** (you must supply an approver name,
  evidence, a verifier name, in the right order) rather than **role-based
  permissions** (no code checks "is this user allowed to verify"), because
  role separation is Phase 3/6 work that was not built.
- Referral (Phase 8), reception (Phase 9), appointment leakage (Phase 10) and
  leave/handover (Phase 11) modules are **not implemented**. The Phase 17
  dashboard says so explicitly rather than showing a fabricated zero for
  those panels.

## What would need to happen to remove this scope note

Build Phases 0–11 properly (organisation/centre/role schema, auth/audit,
generic work-item engine, referral/reception/appointment/handover modules),
then either migrate phases 12–18's `userId` scoping onto the
organisation/centre model, or confirm the single-practice, single-user
deployment this was built for never needs multi-tenant separation.
