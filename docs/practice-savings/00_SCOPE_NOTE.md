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

## Update — Phases 0–11 now exist, but as a separate, unintegrated build

`practice-savings-platform/` (added after this note was first written)
implements Phases 0–11 properly and independently: real
organisation/centre/role tenancy with Postgres Row Level Security, a
DB-backed auth system with MFA for privileged roles, an audit package, and
the generic work-item ownership engine (with transfer-with-acceptance,
Green/Amber/Red/Recovery health states and escalation) that referrals,
reception, appointment-leakage and handover/absence-continuity are all
built on top of. It has its own Cloudflare Worker API (`apps/api`), its own
Neon Postgres schema (`database/migrations`), and its own test suite (149
tests) and CI job (`.github/workflows/practice-savings-platform-ci.yml`) —
see `practice-savings-platform/README.md` and `CHANGELOG.md` for the
phase-by-phase record.

**It is not integrated with the phases 12–18 build described above.** The
two builds currently sit side by side in this repository:

- `practice-savings-platform/` — Phases 0–11, its own Neon database, its
  own Cloudflare Worker, real organisation/centre/role/work-item schema.
- `src/app/(app)/practice/` + this app's Prisma schema — Phases 12–18,
  the personal-budget app's `User`-scoped Neon database, its own
  Cloudflare Workers (Next.js/OpenNext) deployment.

They do not share a database, an API, an auth session, or a permission
model. A referral created in `practice-savings-platform` is invisible to
the Phase 17 dashboard in this app, and vice versa.

## What would need to happen to remove this scope note

Migrate phases 12–18's data model and server actions to read/write
`practice-savings-platform`'s organisation/centre/role/work-item schema
(via its API or a shared database connection) instead of this app's
`userId`-scoped Prisma models — replacing the workflow-gate-based
verification/approval checks described above with the real
`packages/permissions` role checks that already exist in
`practice-savings-platform`. Until that migration happens, treat this as
two builds of one blueprint, not one finished system.
