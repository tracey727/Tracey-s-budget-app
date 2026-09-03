import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { LogWasteForm } from "./LogWasteForm";
import { WasteEventCard } from "./WasteEventCard";

export default async function WastePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [events, linkedSourceIds] = await Promise.all([
    prisma.wasteEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.savingsCase.findMany({
      where: { userId, sourceType: "WASTE_EVENT" },
      select: { sourceId: true },
    }),
  ]);
  const linkedSet = new Set(linkedSourceIds.map((c) => c.sourceId));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ivory">Staff Time Waste &amp; Duplication</h1>
        <p className="mt-1 text-sm text-muted">
          Capture → root cause → intervention → measure. Every verified saving here traces back to a logged
          event and a recorded before/after.
        </p>
      </div>

      <LogWasteForm />

      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <WasteEventCard
            key={event.id}
            event={{
              id: event.id,
              category: event.category,
              description: event.description,
              estimatedMinutes: Number(event.estimatedMinutes),
              isRecurring: event.isRecurring,
              recurrenceNote: event.recurrenceNote,
              rootCause: event.rootCause,
              status: event.status,
              interventionDescription: event.interventionDescription,
              baselineMinutes: event.baselineMinutes != null ? Number(event.baselineMinutes) : null,
              postMinutes: event.postMinutes != null ? Number(event.postMinutes) : null,
              hasSavingsCase: linkedSet.has(event.id),
            }}
          />
        ))}
        {events.length === 0 && (
          <Card>
            <p className="text-sm text-muted">No waste events logged yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
