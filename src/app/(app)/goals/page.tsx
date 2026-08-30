import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateGoalProgress } from "@/lib/engine";
import { formatMoney, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { AddGoalForm, UpdateVerifiedForm } from "./GoalForms";

export default async function GoalsPage() {
  const session = await auth();
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Savings Goals</h1>
        <p className="mt-1 text-sm text-muted">
          Progress reflects verified savings actually held — never intended transfers.
        </p>
      </div>

      <AddGoalForm />

      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal) => {
          const progress = calculateGoalProgress({
            id: goal.id,
            targetAmount: Number(goal.targetAmount),
            verifiedAmount: Number(goal.verifiedAmount),
            contributionPlan: goal.contributionPlan ? Number(goal.contributionPlan) : null,
          });
          return (
            <Card key={goal.id}>
              <p className="text-ivory">{goal.name}</p>
              {goal.targetDate && <p className="text-xs text-muted">By {formatDate(goal.targetDate)}</p>}
              <p className="mt-3 font-display text-2xl text-ivory">
                {formatMoney(goal.verifiedAmount)}{" "}
                <span className="text-sm text-muted">of {formatMoney(goal.targetAmount)}</span>
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-charcoal">
                <div className="h-full bg-gold" style={{ width: `${progress.progressPercent}%` }} />
              </div>
              <UpdateVerifiedForm goalId={goal.id} verifiedAmount={Number(goal.verifiedAmount)} />
            </Card>
          );
        })}
        {goals.length === 0 && (
          <Card>
            <p className="text-sm text-muted">No savings goals yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
