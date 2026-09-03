import type { EngineWasteEvent, WasteStatus } from "./types";
import { round2 } from "./frequency";

/**
 * Phase 12 — Staff Time Waste & Duplication (M05).
 *
 * A waste event moves through a fixed sequence so a "Verified" saving can
 * never exist without the capture → root-cause → intervention → measurement
 * steps the blueprint requires. Status can only move one step forward (or
 * stay put); it never jumps ahead or moves backward through this function.
 */
const WASTE_STATUS_ORDER: WasteStatus[] = [
  "LOGGED",
  "ROOT_CAUSE_CONFIRMED",
  "INTERVENTION_PLANNED",
  "INTERVENTION_ACTIVE",
  "MEASURED",
  "VERIFIED",
];

export interface WasteTransitionCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * Whether a waste event can move from `current` to `target`. `event` supplies
 * the fields that gate specific steps (a baseline must exist before an
 * intervention starts; a post-measurement must exist before it can be
 * measured).
 */
export function canAdvanceWasteStatus(
  current: WasteStatus,
  target: WasteStatus,
  event: Pick<EngineWasteEvent, "baselineMinutes" | "postMinutes">,
): WasteTransitionCheck {
  const currentIndex = WASTE_STATUS_ORDER.indexOf(current);
  const targetIndex = WASTE_STATUS_ORDER.indexOf(target);

  if (targetIndex !== currentIndex + 1) {
    return { allowed: false, reason: "Waste events can only move forward one step at a time." };
  }

  if (target === "INTERVENTION_PLANNED" && event.baselineMinutes == null) {
    return { allowed: false, reason: "Root cause must be confirmed with a frozen baseline before planning an intervention." };
  }

  if (target === "MEASURED" && event.postMinutes == null) {
    return { allowed: false, reason: "Post-intervention minutes must be recorded before this can be measured." };
  }

  if (target === "VERIFIED" && event.postMinutes == null) {
    return { allowed: false, reason: "A measured result is required before verification." };
  }

  return { allowed: true };
}

/** Minutes released by an intervention. Can be negative if the change made things worse. */
export function releasedMinutes(baselineMinutes: number, postMinutes: number): number {
  return round2(baselineMinutes - postMinutes);
}

/**
 * Converts released minutes to a dollar figure using an approved hourly
 * labour-value rate. Per the savings-measurement blueprint (Category D),
 * this is a *value estimate*, not a claim that payroll spend fell — callers
 * must keep the original minutes figure visible alongside it.
 */
export function labourValueOfMinutes(minutes: number, hourlyRate: number): number {
  return round2((minutes / 60) * hourlyRate);
}
