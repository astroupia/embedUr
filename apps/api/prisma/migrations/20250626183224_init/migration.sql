-- CreateEnum
CREATE TYPE "public"."CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_DELETION');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MEMBER', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "public"."SystemNotificationLevel" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'BOOKED', 'DO_NOT_CONTACT');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ReplyClassification" AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'AUTO_REPLY', 'UNSUBSCRIBE', 'QUESTION');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('BOOKED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."WorkflowType" AS ENUM ('LEAD_ENRICHMENT', 'EMAIL_SEQUENCE', 'LEAD_ROUTING');

-- CreateEnum
CREATE TYPE "public"."AIInteractionType" AS ENUM ('DRAFT_EMAIL', 'REPLY_ANALYSIS');

-- CreateEnum
CREATE TYPE "public"."EnrichmentProvider" AS ENUM ('APOLLO', 'DROP_CONTACT', 'CLEARBIT');

-- CreateEnum
CREATE TYPE "public"."WebhookSource" AS ENUM ('SMARTLEAD', 'CALENDLY', 'N8N');

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schemaName" TEXT NOT NULL,
    "status" "public"."CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "planId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'MEMBER',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxLeads" INTEGER NOT NULL DEFAULT 1000,
    "maxWorkflows" INTEGER NOT NULL DEFAULT 100,
    "priceCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."APIKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT,
    "scope" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GlobalSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemNotification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "level" "public"."SystemNotificationLevel" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "enrichmentData" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."LeadStatus" NOT NULL DEFAULT 'NEW',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "aiPersonaId" TEXT,
    "workflowId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIPersona" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "parameters" JSONB,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailLog" (
    "id" TEXT NOT NULL,
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "leadId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reply" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "classification" "public"."ReplyClassification" NOT NULL,
    "handledBy" TEXT,
    "leadId" TEXT NOT NULL,
    "emailLogId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "calendlyLink" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "leadId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."WorkflowType" NOT NULL,
    "n8nWorkflowId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowExecution" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "inputData" JSONB,
    "outputData" JSONB,
    "durationMs" INTEGER,
    "leadId" TEXT,
    "workflowId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIInteraction" (
    "id" TEXT NOT NULL,
    "type" "public"."AIInteractionType" NOT NULL,
    "inputData" JSONB NOT NULL,
    "outputData" JSONB NOT NULL,
    "workflowExecutionId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EnrichmentRequest" (
    "id" TEXT NOT NULL,
    "provider" "public"."EnrichmentProvider" NOT NULL,
    "requestData" JSONB NOT NULL,
    "responseData" JSONB,
    "leadId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrichmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsageMetric" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" "public"."WebhookSource" NOT NULL,
    "payload" JSONB NOT NULL,
    "companyId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditTrail" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedById" TEXT,
    "changes" JSONB,
    "companyId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "public"."Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_schemaName_key" ON "public"."Company"("schemaName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "public"."User"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "public"."Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_key_key" ON "public"."APIKey"("key");

-- CreateIndex
CREATE INDEX "APIKey_companyId_idx" ON "public"."APIKey"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalSettings_key_key" ON "public"."GlobalSettings"("key");

-- CreateIndex
CREATE INDEX "SystemNotification_companyId_idx" ON "public"."SystemNotification"("companyId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "public"."Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_companyId_idx" ON "public"."Lead"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_companyId_key" ON "public"."Lead"("email", "companyId");

-- CreateIndex
CREATE INDEX "Campaign_aiPersonaId_idx" ON "public"."Campaign"("aiPersonaId");

-- CreateIndex
CREATE INDEX "Campaign_workflowId_idx" ON "public"."Campaign"("workflowId");

-- CreateIndex
CREATE INDEX "Campaign_companyId_idx" ON "public"."Campaign"("companyId");

-- CreateIndex
CREATE INDEX "AIPersona_companyId_idx" ON "public"."AIPersona"("companyId");

-- CreateIndex
CREATE INDEX "EmailLog_leadId_idx" ON "public"."EmailLog"("leadId");

-- CreateIndex
CREATE INDEX "EmailLog_campaignId_idx" ON "public"."EmailLog"("campaignId");

-- CreateIndex
CREATE INDEX "EmailLog_companyId_idx" ON "public"."EmailLog"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Reply_emailLogId_key" ON "public"."Reply"("emailLogId");

-- CreateIndex
CREATE INDEX "Reply_leadId_idx" ON "public"."Reply"("leadId");

-- CreateIndex
CREATE INDEX "Reply_companyId_idx" ON "public"."Reply"("companyId");

-- CreateIndex
CREATE INDEX "Booking_leadId_idx" ON "public"."Booking"("leadId");

-- CreateIndex
CREATE INDEX "Booking_companyId_idx" ON "public"."Booking"("companyId");

-- CreateIndex
CREATE INDEX "Workflow_companyId_idx" ON "public"."Workflow"("companyId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_leadId_idx" ON "public"."WorkflowExecution"("leadId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_workflowId_idx" ON "public"."WorkflowExecution"("workflowId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_companyId_idx" ON "public"."WorkflowExecution"("companyId");

-- CreateIndex
CREATE INDEX "AIInteraction_workflowExecutionId_idx" ON "public"."AIInteraction"("workflowExecutionId");

-- CreateIndex
CREATE INDEX "AIInteraction_companyId_idx" ON "public"."AIInteraction"("companyId");

-- CreateIndex
CREATE INDEX "EnrichmentRequest_leadId_idx" ON "public"."EnrichmentRequest"("leadId");

-- CreateIndex
CREATE INDEX "EnrichmentRequest_companyId_idx" ON "public"."EnrichmentRequest"("companyId");

-- CreateIndex
CREATE INDEX "UsageMetric_metricName_idx" ON "public"."UsageMetric"("metricName");

-- CreateIndex
CREATE INDEX "UsageMetric_companyId_idx" ON "public"."UsageMetric"("companyId");

-- CreateIndex
CREATE INDEX "WebhookEvent_companyId_idx" ON "public"."WebhookEvent"("companyId");

-- CreateIndex
CREATE INDEX "AuditTrail_entityId_idx" ON "public"."AuditTrail"("entityId");

-- CreateIndex
CREATE INDEX "AuditTrail_performedById_idx" ON "public"."AuditTrail"("performedById");

-- CreateIndex
CREATE INDEX "AuditTrail_companyId_idx" ON "public"."AuditTrail"("companyId");

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."APIKey" ADD CONSTRAINT "APIKey_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SystemNotification" ADD CONSTRAINT "SystemNotification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Campaign" ADD CONSTRAINT "Campaign_aiPersonaId_fkey" FOREIGN KEY ("aiPersonaId") REFERENCES "public"."AIPersona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Campaign" ADD CONSTRAINT "Campaign_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailLog" ADD CONSTRAINT "EmailLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailLog" ADD CONSTRAINT "EmailLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_emailLogId_fkey" FOREIGN KEY ("emailLogId") REFERENCES "public"."EmailLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIInteraction" ADD CONSTRAINT "AIInteraction_workflowExecutionId_fkey" FOREIGN KEY ("workflowExecutionId") REFERENCES "public"."WorkflowExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnrichmentRequest" ADD CONSTRAINT "EnrichmentRequest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditTrail" ADD CONSTRAINT "AuditTrail_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
