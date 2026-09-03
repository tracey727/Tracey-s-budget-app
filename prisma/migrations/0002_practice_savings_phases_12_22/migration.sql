-- CreateEnum
CREATE TYPE "WasteCategory" AS ENUM ('DUPLICATE_WORK', 'REWORK', 'SEARCHING', 'WAITING', 'MANUAL_ENTRY', 'WRONG_ROLE_WORK', 'UNNECESSARY_APPROVAL');

-- CreateEnum
CREATE TYPE "WasteStatus" AS ENUM ('LOGGED', 'ROOT_CAUSE_CONFIRMED', 'INTERVENTION_PLANNED', 'INTERVENTION_ACTIVE', 'MEASURED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "PatternStatus" AS ENUM ('IDENTIFIED', 'ACTION_ASSIGNED', 'IN_PROGRESS', 'MEASURED');

-- CreateEnum
CREATE TYPE "SavingsCategory" AS ENUM ('RECOVERED_REVENUE', 'AVOIDED_COST', 'RELEASED_STAFF_TIME');

-- CreateEnum
CREATE TYPE "SavingsUnit" AS ENUM ('MINUTES', 'CURRENCY');

-- CreateEnum
CREATE TYPE "SavingsState" AS ENUM ('POTENTIAL', 'APPROVED', 'IMPLEMENTED', 'MEASURED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('WASTE_EVENT', 'RECURRING_COST', 'SYSTEMIC_PATTERN', 'CAPACITY_SNAPSHOT', 'MANUAL');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AlertTrigger" AS ENUM ('WASTE_RECURRING', 'CAPACITY_IDLE_HIGH', 'COST_RENEWAL_DUE', 'PATTERN_UNASSIGNED', 'SAVINGS_STALLED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'ACKNOWLEDGED', 'ACTIONED');

-- AlterTable
ALTER TABLE "RecurringCharge" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decisionNote" TEXT,
ADD COLUMN     "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "owner" TEXT,
ADD COLUMN     "previousAmount" DECIMAL(12,2),
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "renewalDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WasteEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "WasteCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedMinutes" DECIMAL(8,2) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceNote" TEXT,
    "rootCause" TEXT,
    "status" "WasteStatus" NOT NULL DEFAULT 'LOGGED',
    "interventionDescription" TEXT,
    "interventionStartedAt" TIMESTAMP(3),
    "baselineMinutes" DECIMAL(8,2),
    "postMinutes" DECIMAL(8,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WasteEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacitySnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "availableUnits" DECIMAL(10,2) NOT NULL,
    "filledUnits" DECIMAL(10,2) NOT NULL,
    "waitingDemandUnits" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "referralDemandUnits" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cancellationUnits" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "approvedNonWorkingUnits" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapacitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemicPattern" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "PatternStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "estimatedImpactMinutes" DECIMAL(10,2),
    "estimatedImpactCurrency" DECIMAL(12,2),
    "rootCause" TEXT,
    "ownerName" TEXT,
    "dueDate" TIMESTAMP(3),
    "preventionAction" TEXT,
    "measuredResultNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemicPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternEvent" (
    "id" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "note" TEXT,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatternEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsCase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "SavingsCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" "SourceType" NOT NULL DEFAULT 'MANUAL',
    "sourceId" TEXT,
    "baselineValue" DECIMAL(12,2) NOT NULL,
    "baselineUnit" "SavingsUnit" NOT NULL,
    "postValue" DECIMAL(12,2),
    "calculationMethod" TEXT NOT NULL,
    "evidenceNote" TEXT,
    "state" "SavingsState" NOT NULL DEFAULT 'POTENTIAL',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "implementedAt" TIMESTAMP(3),
    "measuredAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingsCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" "AlertTrigger" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "digestOnly" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "thresholdMinutes" DECIMAL(10,2),
    "thresholdDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertRuleId" TEXT,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sourceType" "SourceType",
    "sourceId" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WasteEvent_userId_idx" ON "WasteEvent"("userId");

-- CreateIndex
CREATE INDEX "WasteEvent_userId_status_idx" ON "WasteEvent"("userId", "status");

-- CreateIndex
CREATE INDEX "CapacitySnapshot_userId_idx" ON "CapacitySnapshot"("userId");

-- CreateIndex
CREATE INDEX "CapacitySnapshot_userId_periodStart_idx" ON "CapacitySnapshot"("userId", "periodStart");

-- CreateIndex
CREATE INDEX "SystemicPattern_userId_idx" ON "SystemicPattern"("userId");

-- CreateIndex
CREATE INDEX "SystemicPattern_userId_status_idx" ON "SystemicPattern"("userId", "status");

-- CreateIndex
CREATE INDEX "PatternEvent_patternId_idx" ON "PatternEvent"("patternId");

-- CreateIndex
CREATE INDEX "PatternEvent_sourceType_sourceId_idx" ON "PatternEvent"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "SavingsCase_userId_idx" ON "SavingsCase"("userId");

-- CreateIndex
CREATE INDEX "SavingsCase_userId_state_idx" ON "SavingsCase"("userId", "state");

-- CreateIndex
CREATE INDEX "SavingsCase_userId_category_idx" ON "SavingsCase"("userId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "SavingsCase_sourceType_sourceId_key" ON "SavingsCase"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "AlertRule_userId_idx" ON "AlertRule"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");

-- CreateIndex
CREATE INDEX "RecurringCharge_userId_renewalDate_idx" ON "RecurringCharge"("userId", "renewalDate");

-- AddForeignKey
ALTER TABLE "WasteEvent" ADD CONSTRAINT "WasteEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacitySnapshot" ADD CONSTRAINT "CapacitySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemicPattern" ADD CONSTRAINT "SystemicPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternEvent" ADD CONSTRAINT "PatternEvent_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "SystemicPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsCase" ADD CONSTRAINT "SavingsCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_alertRuleId_fkey" FOREIGN KEY ("alertRuleId") REFERENCES "AlertRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

