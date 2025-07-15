-- CreateEnum
CREATE TYPE "public"."InputFormat" AS ENUM ('FREE_TEXT', 'STRUCTURED_JSON', 'CSV_UPLOAD', 'FORM_INPUT');

-- CreateTable
CREATE TABLE "public"."TargetAudienceTranslator" (
    "id" TEXT NOT NULL,
    "inputFormat" "public"."InputFormat" NOT NULL,
    "targetAudienceData" TEXT NOT NULL,
    "structuredData" JSONB,
    "config" JSONB,
    "leads" JSONB,
    "enrichmentSchema" JSONB,
    "interpretedCriteria" JSONB,
    "reasoning" TEXT,
    "confidence" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "companyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TargetAudienceTranslator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TargetAudienceTranslator_companyId_idx" ON "public"."TargetAudienceTranslator"("companyId");

-- CreateIndex
CREATE INDEX "TargetAudienceTranslator_status_idx" ON "public"."TargetAudienceTranslator"("status");

-- CreateIndex
CREATE INDEX "TargetAudienceTranslator_inputFormat_idx" ON "public"."TargetAudienceTranslator"("inputFormat");
