import { labourValueOfMinutes } from "./waste";
import { round2 } from "./frequency";

/**
 * Phase 15 — Systemic Pattern, Waste & Prevention Command (M09).
 *
 * Patterns group repeated events (waste events, cost reviews, etc.) via an
 * append-only link table (`PatternEvent`) — the underlying events are never
 * mutated, so grouping can never corrupt individual event history.
 */
export interface PatternImpactInput {
  id: string;
  estimatedImpactMinutes: number | null;
  estimatedImpactCurrency: number | null;
}

export interface PatternImpactResult {
  id: string;
  /** Minutes converted to dollars (at the given rate) plus direct currency impact, combined for ranking only. */
  combinedImpactValue: number;
}

/**
 * Ranks patterns by combined estimated/verified impact so the highest-value
 * systemic problems surface first (blueprint step: "Rank patterns by
 * verified/estimated impact"). Minutes are converted using the same
 * labour-value method as Phase 12 so the two impact types can be compared;
 * the original minutes and currency figures must still be shown separately
 * wherever this ranking is displayed.
 */
export function rankPatternsByImpact(
  patterns: PatternImpactInput[],
  hourlyRate: number,
): PatternImpactResult[] {
  return patterns
    .map((pattern) => ({
      id: pattern.id,
      combinedImpactValue: round2(
        (pattern.estimatedImpactCurrency ?? 0) +
          labourValueOfMinutes(pattern.estimatedImpactMinutes ?? 0, hourlyRate),
      ),
    }))
    .sort((a, b) => b.combinedImpactValue - a.combinedImpactValue);
}

/** Prevents the same source event from being linked into one pattern twice. */
export function isAlreadyLinked(
  existingLinks: Array<{ sourceType: string; sourceId: string }>,
  candidate: { sourceType: string; sourceId: string },
): boolean {
  return existingLinks.some(
    (link) => link.sourceType === candidate.sourceType && link.sourceId === candidate.sourceId,
  );
}
