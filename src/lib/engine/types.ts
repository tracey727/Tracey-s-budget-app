export type BillFrequency = "WEEKLY" | "FORTNIGHTLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
export type FundingMethod = "AVERAGED" | "FULL_AMOUNT";
export type BillStatus = "FUNDED" | "PARTIALLY_FUNDED" | "DUE_NEXT" | "OVERDUE" | "AT_RISK";
export type MoneyStatus = "GREEN" | "YELLOW" | "RED" | "RECOVERY";
export type AccountType = "PERSONAL" | "BUSINESS_OPERATING";

export interface EngineAccount {
  id: string;
  type: AccountType;
  currentBalance: number;
  /** Manually reserved amount that is never available as safe-to-spend. */
  protectedAmount: number;
  archived: boolean;
}

export interface EngineBill {
  id: string;
  accountId: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  fundingMethod: FundingMethod;
  archived: boolean;
}

export interface EngineTransaction {
  id: string;
  accountId: string;
  amount: number;
  date: Date;
  isTransfer: boolean;
  classification?: "ESSENTIAL" | "WORTH_IT" | "UNSURE" | "WASTE";
}

export interface EngineSavingsGoal {
  id: string;
  targetAmount: number;
  verifiedAmount: number;
  contributionPlan: number | null;
}

// ---------------------------------------------------------------------------
// Practice Savings & Revenue Protection Command — phases 12-18.
// ---------------------------------------------------------------------------

export type WasteCategory =
  | "DUPLICATE_WORK"
  | "REWORK"
  | "SEARCHING"
  | "WAITING"
  | "MANUAL_ENTRY"
  | "WRONG_ROLE_WORK"
  | "UNNECESSARY_APPROVAL";

export type WasteStatus =
  | "LOGGED"
  | "ROOT_CAUSE_CONFIRMED"
  | "INTERVENTION_PLANNED"
  | "INTERVENTION_ACTIVE"
  | "MEASURED"
  | "VERIFIED";

export type PatternStatus = "IDENTIFIED" | "ACTION_ASSIGNED" | "IN_PROGRESS" | "MEASURED";

export type SavingsCategory = "RECOVERED_REVENUE" | "AVOIDED_COST" | "RELEASED_STAFF_TIME";

export type SavingsUnit = "MINUTES" | "CURRENCY";

export type SavingsState = "POTENTIAL" | "APPROVED" | "IMPLEMENTED" | "MEASURED" | "VERIFIED";

export type SourceType = "WASTE_EVENT" | "RECURRING_COST" | "SYSTEMIC_PATTERN" | "CAPACITY_SNAPSHOT" | "MANUAL";

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH";

export type AlertTrigger =
  | "WASTE_RECURRING"
  | "CAPACITY_IDLE_HIGH"
  | "COST_RENEWAL_DUE"
  | "PATTERN_UNASSIGNED"
  | "SAVINGS_STALLED";

export type NotificationStatus = "UNREAD" | "ACKNOWLEDGED" | "ACTIONED";

export interface EngineWasteEvent {
  id: string;
  category: WasteCategory;
  isRecurring: boolean;
  status: WasteStatus;
  estimatedMinutes: number;
  baselineMinutes: number | null;
  postMinutes: number | null;
}

export interface EngineCapacitySnapshot {
  id: string;
  availableUnits: number;
  filledUnits: number;
  waitingDemandUnits: number;
  referralDemandUnits: number;
  cancellationUnits: number;
  approvedNonWorkingUnits: number;
}

export interface EngineRecurringCost {
  id: string;
  amount: number;
  previousAmount: number | null;
  renewalDate: Date | null;
  isDuplicate: boolean;
  reviewStatus: "UNREVIEWED" | "KEEP" | "RECONSIDER" | "CANCELLED";
}

export interface EngineSavingsCase {
  id: string;
  category: SavingsCategory;
  baselineValue: number;
  baselineUnit: SavingsUnit;
  postValue: number | null;
  state: SavingsState;
  evidenceNote: string | null;
}
