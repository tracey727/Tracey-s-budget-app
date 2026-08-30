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
