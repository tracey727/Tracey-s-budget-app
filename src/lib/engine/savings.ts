import type { SavingsCategory, SavingsState } from "./types";
import { round2 } from "./frequency";

/**
 * Phase 16 — Verified Savings Ledger (M10).
 *
 * Enforces the Potential -> Approved -> Implemented -> Measured -> Verified
 * lifecycle (01_PRODUCT_CONTRACT.md §7) as a strict forward-only sequence,
 * each step gated on the evidence the savings-measurement blueprint
 * requires before it may occur.
 */
const SAVINGS_STATE_ORDER: SavingsState[] = ["POTENTIAL", "APPROVED", "IMPLEMENTED", "MEASURED", "VERIFIED"];

export interface SavingsTransitionCheck {
  allowed: boolean;
  reason?: string;
}

export interface SavingsCaseGateFields {
  baselineValue: number;
  postValue: number | null;
  evidenceNote: string | null;
  approvedBy: string | null;
  verifiedBy: string | null;
}

export function canAdvanceSavingsState(
  current: SavingsState,
  target: SavingsState,
  fields: SavingsCaseGateFields,
): SavingsTransitionCheck {
  const currentIndex = SAVINGS_STATE_ORDER.indexOf(current);
  const targetIndex = SAVINGS_STATE_ORDER.indexOf(target);

  if (targetIndex !== currentIndex + 1) {
    return { allowed: false, reason: "Savings cases can only move forward one lifecycle step at a time." };
  }

  if (target === "APPROVED") {
    if (fields.baselineValue <= 0) {
      return { allowed: false, reason: "A saving must have a positive baseline before it can be approved." };
    }
    if (!fields.approvedBy) {
      return { allowed: false, reason: "An approving manager must be recorded." };
    }
  }

  if (target === "MEASURED" && fields.postValue == null) {
    return { allowed: false, reason: "The actual measured result must be recorded before this step." };
  }

  if (target === "VERIFIED") {
    if (!fields.evidenceNote) {
      return { allowed: false, reason: "A saving cannot be Verified without evidence (product contract rule #6)." };
    }
    if (!fields.verifiedBy) {
      return { allowed: false, reason: "A verifier must be recorded." };
    }
  }

  return { allowed: true };
}

/**
 * The verified amount depends on the category — see 08_SAVINGS_MEASUREMENT.md:
 * - RECOVERED_REVENUE: the actual replacement value achieved (postValue).
 *   Never count it merely because a candidate was contacted.
 * - AVOIDED_COST: old recurring cost minus new recurring cost.
 * - RELEASED_STAFF_TIME: baseline minutes minus post-intervention minutes.
 */
export function computeVerifiedAmount(
  category: SavingsCategory,
  baselineValue: number,
  postValue: number,
): number {
  if (category === "RECOVERED_REVENUE") return round2(postValue);
  return round2(baselineValue - postValue);
}

export interface SavingsSourceLink {
  sourceType: string;
  sourceId: string | null;
}

/**
 * Double-counting control (business rule #7): a single source event may back
 * at most one savings case. This mirrors the `@@unique([sourceType, sourceId])`
 * database constraint so the rule is testable without a database, and so
 * server actions can produce a clear error before hitting the DB constraint.
 * MANUAL entries (sourceId null) are always allowed — there is no shared
 * source to double-count.
 */
export function isDuplicateSourceLink(
  existingCases: SavingsSourceLink[],
  candidate: SavingsSourceLink,
): boolean {
  if (candidate.sourceId == null) return false;
  return existingCases.some(
    (existing) => existing.sourceType === candidate.sourceType && existing.sourceId === candidate.sourceId,
  );
}

export interface SavingsSummaryInput {
  category: SavingsCategory;
  state: SavingsState;
  baselineValue: number;
  postValue: number | null;
}

export interface SavingsSummary {
  verifiedRecoveredRevenue: number;
  verifiedAvoidedCost: number;
  verifiedReleasedTimeMinutes: number;
  potentialValue: number;
  totalVerifiedBenefit: number;
}

/**
 * Reconstructs dashboard headline totals purely from underlying case rows
 * (Phase 17 GREEN GATE: "Dashboard total can be reconstructed from
 * underlying verified cases"). Only VERIFIED cases count toward verified
 * totals; everything else rolls into the labelled "potential" bucket.
 */
export function summariseSavings(cases: SavingsSummaryInput[]): SavingsSummary {
  let verifiedRecoveredRevenue = 0;
  let verifiedAvoidedCost = 0;
  let verifiedReleasedTimeMinutes = 0;
  let potentialValue = 0;

  for (const c of cases) {
    if (c.state !== "VERIFIED" || c.postValue == null) {
      // Potential/unverified value is shown separately and never mixed into a verified total.
      potentialValue = round2(potentialValue + c.baselineValue);
      continue;
    }

    const amount = computeVerifiedAmount(c.category, c.baselineValue, c.postValue);
    if (c.category === "RECOVERED_REVENUE") verifiedRecoveredRevenue = round2(verifiedRecoveredRevenue + amount);
    else if (c.category === "AVOIDED_COST") verifiedAvoidedCost = round2(verifiedAvoidedCost + amount);
    else verifiedReleasedTimeMinutes = round2(verifiedReleasedTimeMinutes + amount);
  }

  return {
    verifiedRecoveredRevenue,
    verifiedAvoidedCost,
    verifiedReleasedTimeMinutes,
    potentialValue,
    // Released staff time is reported as minutes, not currency, so it is
    // deliberately excluded here — converting it requires an approved
    // labour rate, which callers apply separately (see labourValueOfMinutes).
    totalVerifiedBenefit: round2(verifiedRecoveredRevenue + verifiedAvoidedCost),
  };
}
