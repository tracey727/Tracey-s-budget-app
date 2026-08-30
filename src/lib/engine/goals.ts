import type { EngineSavingsGoal } from "./types";
import { round2 } from "./frequency";

export interface GoalProgress {
  goalId: string;
  targetAmount: number;
  verifiedAmount: number;
  progressPercent: number;
  remaining: number;
}

/**
 * Progress uses only verified savings actually held — never intended
 * contributions — so a goal can never hide an upcoming cash-flow problem.
 */
export function calculateGoalProgress(goal: EngineSavingsGoal): GoalProgress {
  const progressPercent =
    goal.targetAmount <= 0 ? 0 : round2(Math.min(100, (goal.verifiedAmount / goal.targetAmount) * 100));

  return {
    goalId: goal.id,
    targetAmount: goal.targetAmount,
    verifiedAmount: goal.verifiedAmount,
    progressPercent,
    remaining: round2(Math.max(0, goal.targetAmount - goal.verifiedAmount)),
  };
}
