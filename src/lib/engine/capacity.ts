import type { EngineCapacitySnapshot } from "./types";
import { round2 } from "./frequency";

/**
 * Phase 13 — Capacity & Utilisation (M07).
 *
 * Splits idle capacity into three buckets so approved non-working time is
 * never counted as a failure, and so "recoverable" (idle capacity that
 * existing demand could actually fill) is kept separate from harmless spare
 * capacity with no demand behind it. This separation is the Phase 13 GREEN
 * GATE requirement.
 */
export interface CapacityBreakdown {
  idleUnits: number;
  avoidableIdleUnits: number;
  /** Idle capacity that waiting/referral demand could fill right now. */
  recoverableUnits: number;
  /** Idle capacity with no demand behind it — not a failure. */
  legitimateSpareUnits: number;
  utilisationPercent: number;
}

export function classifyCapacity(snapshot: EngineCapacitySnapshot): CapacityBreakdown {
  const {
    availableUnits,
    filledUnits,
    waitingDemandUnits,
    referralDemandUnits,
    approvedNonWorkingUnits,
  } = snapshot;

  const idleUnits = Math.max(0, round2(availableUnits - filledUnits));
  const avoidableIdleUnits = Math.max(0, round2(idleUnits - approvedNonWorkingUnits));
  const demandUnits = Math.max(0, round2(waitingDemandUnits + referralDemandUnits));
  const recoverableUnits = round2(Math.min(avoidableIdleUnits, demandUnits));
  const legitimateSpareUnits = round2(avoidableIdleUnits - recoverableUnits);
  const utilisationPercent = availableUnits <= 0 ? 0 : round2((filledUnits / availableUnits) * 100);

  return { idleUnits, avoidableIdleUnits, recoverableUnits, legitimateSpareUnits, utilisationPercent };
}

/** Trend direction between two utilisation readings, for the dashboard's capacity panel. */
export function utilisationTrend(previousPercent: number, currentPercent: number): "UP" | "DOWN" | "FLAT" {
  const delta = round2(currentPercent - previousPercent);
  if (delta > 0.5) return "UP";
  if (delta < -0.5) return "DOWN";
  return "FLAT";
}
