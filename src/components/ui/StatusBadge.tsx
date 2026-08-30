import type { MoneyStatus } from "@/lib/engine";

const STYLES: Record<MoneyStatus, string> = {
  GREEN: "bg-status-green/15 text-status-green border-status-green/40",
  YELLOW: "bg-status-yellow/15 text-status-yellow border-status-yellow/40",
  RED: "bg-status-red/15 text-status-red border-status-red/40",
  RECOVERY: "bg-status-recovery/15 text-status-recovery border-status-recovery/40",
};

const LABELS: Record<MoneyStatus, string> = {
  GREEN: "Green — on track",
  YELLOW: "Yellow — pressure building",
  RED: "Red — recovery required",
  RECOVERY: "Recovery in progress",
};

export function StatusBadge({ status }: { status: MoneyStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${STYLES[status]}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}
