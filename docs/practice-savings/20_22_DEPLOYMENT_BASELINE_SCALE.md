# Phases 20–22 — Production Deployment, Baseline & Scale

These are operational/process phases, not code. This session has no
production Neon project, no production Cloudflare account access, and no
real practice data — so these are delivered as **runbooks to execute**,
not as completed steps. Do not mark any of them GREEN until a human with
the relevant access has actually done the listed action and recorded the
evidence.

## Phase 20 — Production Deployment & Controlled Pilot

Follow the pattern already established by this repo's own deployment
history (`git log`: "Migrate deployment target from Vercel to Cloudflare
Workers", "Pin Node 22", "Force Prisma Client regeneration on every
build", etc.) — this app already deploys to Cloudflare Workers with Neon
via `@prisma/adapter-neon` (see `src/lib/prisma.ts`).

1. Create a **production** Neon branch, separate from any dev/preview
   branch, per `wrangler.jsonc` / `open-next.config.ts`.
2. Create a least-privilege Neon **runtime role** for the production
   Worker — not the branch owner role. Grant it exactly the
   privileges the app's queries need (`SELECT`/`INSERT`/`UPDATE`/`DELETE`
   on the app's own tables), nothing at the database-owner level.
3. Set `DATABASE_URL` / `DIRECT_URL` / `AUTH_SECRET` / Stripe keys as
   Cloudflare Worker **secrets** (`wrangler secret put ...`), never
   committed — `.env.example` already documents every required variable
   with empty values.
4. Deploy through the protected `main` branch only (`npm run deploy` runs
   `opennextjs-cloudflare build && opennextjs-cloudflare deploy`).
5. Run `prisma migrate deploy` (not `migrate dev`) against the production
   database before or as part of the deploy step, applying
   `0001_init` then `0002_practice_savings_phases_12_22` in order.
6. Smoke test with **synthetic** records first: sign up a synthetic test
   user, log a synthetic waste event through to Verified, add a synthetic
   capacity snapshot, confirm the dashboard reflects both.
7. Enable real pilot users gradually (start with Irene/the practice
   manager before wider reception/clinician access).
8. Monitor errors (Cloudflare Worker logs), queue health (none of these
   modules currently use a queue — everything is synchronous request/
   response, so "queue health" here just means request error rate), and
   access events.
9. **Do not import real operational data** (real referrals, real staff
   names tied to real waste events, real supplier contracts) until the
   Phase 6 governance checklist in `06_SECURITY_PRIVACY_GOVERNANCE.md` is
   confirmed — that checklist was not re-run as part of this build because
   Phase 6 (auth/audit) itself was out of this build's scope; see
   `00_SCOPE_NOTE.md`.

**GREEN GATE (unmet until executed)**: production environment healthy;
pilot access controlled; monitoring and rollback ready.

## Phase 21 — Baseline Period & First Verified Savings

1. Agree a baseline period with the practice (e.g. 4–6 weeks) before
   claiming any savings.
2. Record real events during that period using the modules built here
   (waste events, capacity snapshots, recurring-cost reviews) — under
   whatever governance approval Phase 20 step 9 required.
3. Validate data quality: spot-check that logged minutes/amounts are
   plausible, that recurring waste is actually recurring, that capacity
   snapshots reconcile against the practice's own scheduling system.
4. Implement the first one or two small interventions (the smallest,
   highest-confidence waste event or recurring-cost cancellation is the
   right place to start).
5. Measure before/after using the same workflow tested in
   `19_REGRESSION_SECURITY_UAT.md`'s UAT script.
6. Take the case through Approved → Implemented → Measured → Verified in
   the ledger, with real evidence (an actual invoice, an actual reduced
   subscription bill, an actual measured time).

**GREEN GATE (unmet until executed)**: first verified savings cases
completed without double-counting (enforced by the `SavingsCase` unique
source-link constraint) or unsupported assumptions (enforced by the
`canAdvanceSavingsState` evidence/verifier gate).

## Phase 22 — Scale, Optimise & Prevent

Ongoing operating cadence once Phase 21 has produced real verified cases:

1. Review the Patterns page monthly; assign prevention actions to the
   highest-ranked open patterns.
2. Retire alert rules that generate more noise than value (the
   `AlertRule.enabled` toggle already supports this without deleting
   history).
3. For any waste pattern that has been Verified more than once, consider
   it "stable and repetitive" and evaluate automating it outside this
   system (this system tracks the waste and the saving; it does not
   itself automate practice workflows).
4. Feed verified capacity/cost/staffing evidence into real staffing and
   purchasing decisions.
5. Produce a quarterly savings review from the ledger's month/FY/all-time
   summaries (already computed by `summariseSavings`).
6. Keep the feature register (`feature_register.json` in the original
   blueprint package) and this repo's own change history in sync — every
   new module should be a reviewed PR, not a silent schema change.
7. Re-run the Phase 19 security/permission checks after any material
   change (new module, new role, new integration).

**GREEN GATE**: this becomes a continuous cycle, not a one-off audit —
there is no single "done" commit for Phase 22; it is re-entered every
review cycle.
